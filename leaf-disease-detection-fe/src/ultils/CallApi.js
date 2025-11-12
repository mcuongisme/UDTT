const API_URL = process.env.API_URL
export const predictImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error("Vui lòng chọn một tệp ảnh để dự đoán.");
    }
    const formData = new FormData();
    formData.append('file', imageFile);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP status: ${response.status}` }));
            throw new Error(`Lỗi API (${response.status}): ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        throw new Error(`Không thể kết nối hoặc xử lý dự đoán: ${error.message}`);
    }
}
