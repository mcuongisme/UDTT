import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import tempfile
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    'corn': os.path.join(BASE_DIR, 'corn_leaf_model.h5'),
    'mango': os.path.join(BASE_DIR, 'mango_leaf_model.h5')  # <-- Thay tên file model xoài
}

IMG_HEIGHT, IMG_WIDTH = 150, 150

# Danh sách bệnh theo loại lá
CLASS_NAMES = {
    'corn': ['chay-la', 'dom-la', 'gi-sat', 'khoe-manh'],
    'mango': [
        'Anthracnose',
        'Bacterial Canker',
        'Cutting Weevil',
        'Die Back',
        'Gall Midge',
        'Healthy',
        'Powdery Mildew',
        'Sooty Mould'
    ]
}

models = {}
for leaf_type, path in MODEL_PATHS.items():
    try:
        print(f"Đang tải model cho {leaf_type} từ: {path}")
        models[leaf_type] = load_model(path)
        print(f"Model {leaf_type} tải thành công.")
    except Exception as e:
        print(f"LỖI: Không thể tải model {leaf_type} tại {path}. Lỗi: {e}")
        models[leaf_type] = None

def decode_base64_image(base64_string):
    """Chuyển base64 thành PIL Image"""
    try:
        if ';base64,' in base64_string:
            base64_string = base64_string.split(';base64,')[1]
        
        img_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(img_data)).convert('RGB')
        return img
    except Exception as e:
        raise ValueError(f"Không thể giải mã base64: {str(e)}")

def preprocess_image_pil(img):
    """Resize và chuẩn hóa ảnh PIL"""
    img = img.resize((IMG_HEIGHT, IMG_WIDTH))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    leaf_type = None
    image_file = None
    image_b64 = None

    if request.content_type and 'multipart/form-data' in request.content_type:
        if 'image' not in request.files:
            return jsonify({'error': 'Thiếu file ảnh'}), 400
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'File rỗng'}), 400
        leaf_type = request.form.get('leaf_type', '').lower()

    elif request.is_json:
        data = request.get_json()
        image_b64 = data.get('image')
        leaf_type = data.get('leaf_type', '').lower()

    else:
        return jsonify({'error': 'Content-Type phải là application/json hoặc multipart/form-data'}), 415

    if leaf_type not in ['corn', 'mango']:
        return jsonify({'error': 'leaf_type phải là "corn" hoặc "mango"'}), 400

    model = models.get(leaf_type)
    if model is None:
        return jsonify({'error': f'Mô hình {leaf_type} chưa tải'}), 500

    class_names = CLASS_NAMES[leaf_type]

    try:
        # --- Xử lý ảnh ---
        if image_file:
            # Dùng tempfile
            with tempfile.NamedTemporaryFile(delete=False) as temp:
                image_file.save(temp.name)
                temp_path = temp.name
            pil_img = Image.open(temp_path).convert('RGB')
            os.unlink(temp_path)
        else:
            # Base64
            pil_img = decode_base64_image(image_b64)

        # Tiền xử lý
        processed_img = preprocess_image_pil(pil_img)

        # Dự đoán
        predictions = model.predict(processed_img)
        predicted_index = np.argmax(predictions[0])
        predicted_name = class_names[predicted_index]
        confidence = float(np.max(predictions[0])) * 100

        return jsonify({
            'leaf_type': leaf_type,
            'prediction': predicted_name,
            'confidence': f'{confidence:.2f}%',
            'all_probabilities': dict(zip(class_names, [f'{p:.2f}%' for p in predictions[0] * 100]))
        })

    except Exception as e:
        return jsonify({'error': f'Lỗi xử lý: {str(e)}'}), 500

# --- CHẠY SERVER ---
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5173)