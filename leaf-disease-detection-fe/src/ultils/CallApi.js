export const predictImage = async (imageFile, leafType) => {
    const API_URL = "http://192.168.1.10:5173/predict";
    if (!imageFile) {
        throw new Error("Vui lòng chọn một tệp ảnh để dự đoán.");
    }
    if (!leafType || !['corn', 'mango'].includes(leafType)) {
        throw new Error("Vui lòng chọn loại lá hợp lệ.");
    }
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('leaf_type', leafType);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(`Lỗi API: ${errorMessage}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        throw new Error(`Không thể kết nối đến server: ${error.message}`);
    }
};