import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { predictImage } from "../ultils/CallApi";

export default function UploadPage() {
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!image) return alert("Hãy chọn ảnh trước!");

        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", image);

        try {
            const data = await predictImage(image);

            const resultData = {
                label: data.prediction,
                confidence: data.confidence,
            };

            navigate("/result", {
                state: { data: resultData, image: URL.createObjectURL(image) },
            });

        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            alert(`Có lỗi khi upload ảnh: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl m-3 flex flex-col gap-3 md:p-8 max-w-xl w-full border border-white/20">
                <div className="flex flex-col items-center text-center gap-5">
                    <div className="text-6xl mb-4 text-green-300">🌿</div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-wider">
                        Hệ thống AI nhận diện bệnh trên lá cây
                    </h1>
                    <p className="text-xl text-gray-200 max-w-md font-light">
                        Tải ảnh chất lượng cao của cây trồng lên để được chẩn đoán tức thì và nhận lời khuyên chăm sóc từ chuyên gia.
                    </p>
                </div>

                <form onSubmit={handleUpload} className="flex flex-col items-center h-auto w-full">

                    <label htmlFor="file-upload" className="w-full cursor-pointer">
                        <div className={`flex flex-col items-center justify-center h-48 border-4 border-dashed rounded-xl transition duration-300 ${image ? 'border-green-400 bg-black/40' : 'border-green-500/70 bg-black/30 hover:bg-black/40 hover:border-green-400'}`}>
                            <svg className="w-12 h-12 text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            <p className="text-lg text-white font-semibold">Kéo & Thả hoặc Nhấn để Tải ảnh</p>
                            <p className="text-sm text-gray-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                        </div>
                    </label>

                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="hidden"
                    />
                    {image && (
                        <div className="flex flex-col items-center mt-2 gap-2 w-full">
                            <img
                                src={URL.createObjectURL(image)}
                                alt="preview"
                                className="max-h-64 rounded-lg shadow-lg"
                            />
                            <div className="text-sm text-green-400 p-2 bg-black/20 rounded-lg w-full text-center">
                                Đã chọn file: {image.name}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-6 w-full h-auto justify-center">
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={!image || isLoading} // Vô hiệu hóa khi không có ảnh hoặc đang loading
                            icon={<SearchOutlined color="white" />}
                            loading={isLoading} // Hiển thị trạng thái loading của Ant Design
                        >
                            <div className="flex items-center gap-2 text-amber-50">
                                {isLoading ? "Đang dự đoán..." : "Dự đoán"}
                            </div>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}