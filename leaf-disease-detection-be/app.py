import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS # Thư viện để xử lý CORS
from tensorflow.keras.models import load_model
import tempfile
# --- KHỞI TẠO VÀ CẤU HÌNH ---
app = Flask(__name__)
CORS(app) 

MODEL_PATH = 'model.h5'
IMG_HEIGHT, IMG_WIDTH = 150, 150
CLASS_NAMES = [
    'guava_diseased',
    'guava_healthy',
    'jamun_diseased',
    'jamun_healthy',
    'lemon_diseased',
    'lemon_healthy',
    'mango_diseased',
    'mango_healthy',
    'pomegranate_diseased',
    'pomegranate_healthy'
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
    img_array = np.expand_dims(img_array, axis=0) # Thêm chiều batch
    # Chuẩn hóa - PHẢI KHỚP VỚI CÁCH BẠN TRAINING
    img_array = img_array / 255.0 
    return img_array

# --- API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Mô hình chưa được tải trên server.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'Không tìm thấy file ảnh trong request.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tên file trống.'}), 400

    # Lưu file tạm thời để xử lý
    file_path = f"temp_{file.filename}"
    file.save(file_path)

    try:
        # 1. Tiền xử lý
        processed_img = preprocess_image(file_path)
        
        # 2. Dự đoán
        predictions = model.predict(processed_img)
        
        # 3. Lấy kết quả
        predicted_index = np.argmax(predictions[0])
        predicted_name = CLASS_NAMES[predicted_index]
        confidence = float(np.max(predictions[0])) * 100
        
        # 4. Xóa file tạm và trả về
        os.remove(file_path)
        
        return jsonify({
            'prediction': predicted_name,
            'confidence': f'{confidence:.2f}%',
            'details': predictions[0].tolist() 
        })
    except Exception as e:
        # Đảm bảo file tạm bị xóa ngay cả khi có lỗi
        if os.path.exists(file_path):
             os.remove(file_path)
        return jsonify({'error': f'Lỗi xử lý dự đoán: {str(e)}'}), 500


# --- CHẠY SERVER ---
if __name__ == '__main__':
    # Chạy server trên cổng 5000 (React thường chạy trên 3000)
    app.run(debug=True, host='0.0.0.0', port=5000)