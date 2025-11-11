import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) return <p>Không có dữ liệu.</p>;

    const { data, image } = state;

    return (
        <div className="flex flex-col items-center p-8">
            <h2 className="text-2xl font-bold mb-4">Kết quả dự đoán</h2>
            <img src={image} alt="uploaded" className="h-64 mb-4 rounded-xl" />
            <p className="text-lg mb-2">🩺 <strong>Kết quả:</strong> {data.label}</p>
            <p className="text-gray-600">Độ tin cậy: {(data.confidence * 100).toFixed(2)}%</p>
            <button
                onClick={() => navigate("/")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                Tải ảnh khác
            </button>
        </div>
    );
}
