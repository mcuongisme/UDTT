import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS 
from tensorflow.keras.models import load_model
import tempfile 

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
MODEL_PATH = os.path.join(BASE_DIR, 'corn_leaf_model.h5') 

IMG_HEIGHT, IMG_WIDTH = 150, 150
CLASS_NAMES = [
    'chay-la', 
    'dom-la', 
    'gi-sat', 
    'khoe-manh'
]
try:
    model = load_model(MODEL_PATH)
    print("Mô hình đã được tải thành công.")
except Exception as e:
    print(f"LỖI: Không thể tải mô hình tại {MODEL_PATH}. Lỗi: {e}")
    model = None

# --- HÀM HỖ TRỢ ---
def preprocess_image(file_path):
    """Tiền xử lý file ảnh thành mảng numpy sẵn sàng cho Keras."""
    img = Image.open(file_path).convert('RGB')
    img = img.resize((IMG_HEIGHT, IMG_WIDTH))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0) 
    img_array = img_array / 255.0 
    return img_array

# --- API ENDPOINT (ĐÃ SỬA DÙNG TEMPFİLE) ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Mô hình chưa được tải trên server.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'Không tìm thấy file ảnh trong request.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tên file trống.'}), 400

    temp_path = None
    try:
        # 1. Lưu file tạm thời an toàn
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            file.save(temp.name)
            temp_path = temp.name 
        
        # 2. Tiền xử lý
        processed_img = preprocess_image(temp_path)
        
        # 3. Dự đoán
        predictions = model.predict(processed_img)
        
        # 4. Lấy kết quả
        predicted_index = np.argmax(predictions[0])
        predicted_name = CLASS_NAMES[predicted_index]
        confidence = float(np.max(predictions[0])) * 100
        
        return jsonify({
            'prediction': predicted_name,
            'confidence': f'{confidence:.2f}%',
            'details': predictions[0].tolist() 
        })
        
    except Exception as e:
        return jsonify({'error': f'Lỗi xử lý dự đoán: {str(e)}'}), 500
        
    finally:
        # Đảm bảo file tạm bị xóa
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# --- CHẠY SERVER (Chỉ dùng cho cục bộ) ---
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5173)