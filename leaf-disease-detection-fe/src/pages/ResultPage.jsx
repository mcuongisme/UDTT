import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function ResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    if (!state || !state.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
                <div className="text-center bg-red-800/50 p-10 rounded-xl shadow-2xl border border-red-500/30">
                    <h2 className="text-3xl font-bold mb-4">Lỗi Truy Cập Dữ Liệu</h2>
                    <p className="text-lg mb-6">Không tìm thấy kết quả dự đoán. Vui lòng thử tải ảnh lại.</p>
                    <Button
                        type="primary"
                        danger
                        onClick={() => navigate("/")}
                        className="px-6 py-3 text-lg font-semibold"
                    >
                        Quay lại Trang Tải Ảnh
                    </Button>
                </div>
            </div>
        );
    }
    const { data, image } = state;

    const confidenceString = String(data.confidence).replace('%', '').trim();
    const numericConfidence = parseFloat(confidenceString);

    const confidenceDisplay = numericConfidence.toFixed(2);
    const confidenceColor =
        numericConfidence > 90
            ? 'bg-emerald-600'
            : 'bg-yellow-600';

    const labelMap = {
        'chay-la': 'Bệnh Cháy Lá (Leaf Blight)',
        'dom-la': 'Bệnh Đốm Lá (Spot)',
        'gi-sat': 'Bệnh Gỉ Sắt (Rust)',
        'khoe-manh': 'Khỏe Mạnh (Healthy)',
    };
    const displayLabel = labelMap[data.label] || data.label;

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen p-8"
        >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 max-w-4xl w-full border border-white/20">

                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white text-center tracking-wider">
                    <CheckCircleOutlined /> Kết Quả Phân Tích
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="flex flex-col items-center">
                        <img
                            src={image}
                            alt="uploaded plant leaf"
                            className="w-full h-auto max-h-96 object-cover rounded-2xl shadow-xl border-4 border-emerald-500/50"
                        />
                    </div>
                    {numericConfidence >= 60 ? (

                        <div className="flex flex-col gap-6">
                            <div className="p-6 rounded-2xl bg-black/30 shadow-inner">
                                <p className="text-lg font-semibold text-gray-400 mb-2">🩺 Tình trạng được phát hiện:</p>
                                <h2 className="text-4xl font-black text-emerald-400 mb-4 tracking-wide">
                                    {displayLabel}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-medium text-gray-300">Độ tin cậy Mô hình:</p>
                                    <span className={`text-white text-md font-bold px-4 py-1 rounded-full ${confidenceColor}`}>
                                        {confidenceDisplay}%
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-black/30 shadow-inner text-gray-200">
                                <p className="text-lg font-semibold text-gray-400 mb-2">💡 Khuyến nghị sơ bộ:</p>
                                <p>
                                    {displayLabel === 'Khỏe Mạnh (Healthy)' ?
                                        "Cây trồng của bạn đang ở trạng thái tốt. Tiếp tục duy trì chế độ chăm sóc và kiểm tra định kỳ." :
                                        "Đây là dấu hiệu của bệnh cần can thiệp sớm. Vui lòng tham khảo ý kiến chuyên gia nông nghiệp để có phương pháp điều trị chính xác."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="p-6 rounded-2xl bg-black/30 shadow-inner">
                                <p className="text-lg font-semibold text-red-400 mb-2">Lá cây khó nhận diện hoặc không phải cây bắp 😢:</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-medium text-gray-300">Độ tin cậy quá thấp không đáng tin tưởng:</p>
                                    <span className={`text-white text-md font-bold px-4 py-1 rounded-full ${confidenceColor}`}>
                                        {confidenceDisplay}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button
                        onClick={() => navigate("/")}
                        className="px-12 py-3 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg transition duration-300 transform hover:scale-[1.02] text-white"
                        type="primary"
                    >
                        Tải ảnh khác
                    </Button>
                </div>
            </div>
        </div>
    );
}