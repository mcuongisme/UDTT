import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { labelMap, advice } from "../data";
export default function ResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state || !state.data || !state.image) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
                <div className="text-center bg-red-800/50 p-10 rounded-xl shadow-2xl border border-red-500/30">
                    <h2 className="text-3xl font-bold mb-4">Lỗi Truy Cập Dữ Liệu</h2>
                    <p className="text-lg mb-6">Không tìm thấy kết quả dự đoán. Vui lòng thử lại.</p>
                    <Button type="primary" danger onClick={() => navigate("/")} className="px-6 py-3 text-lg font-semibold">
                        Quay lại Trang Tải Ảnh
                    </Button>
                </div>
            </div>
        );
    }
    const { data, image } = state;
    const { label, confidence, leafType } = data;

    const confidenceStr = String(confidence).replace('%', '').trim();
    const numericConfidence = parseFloat(confidenceStr);
    const confidenceDisplay = numericConfidence.toFixed(2);

    const confidenceColor =
        numericConfidence > 90 ? "bg-emerald-600" :
            numericConfidence > 70 ? "bg-yellow-500" :
                "bg-red-600";



    const translations = labelMap[leafType] || {};
    const displayLabel = translations[label] || label;

    const getAdvice = () => {
        if (numericConfidence < 60) {
            return "Độ tin cậy quá thấp. Có thể ảnh không rõ, không phải lá cây, hoặc không thuộc loại đã chọn. Vui lòng chụp lại ảnh rõ nét hơn.";
        }

        if (label.includes('khoe') || label.includes('Healthy')) {
            return "Cây trồng đang khỏe mạnh. Tiếp tục duy trì chế độ tưới nước, bón phân và kiểm tra định kỳ.";
        }



        return advice[leafType]?.[label] || "Vui lòng tham khảo chuyên gia nông nghiệp gần nhất để được tư vấn cụ thể.";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 ">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 max-w-5xl w-full border border-white/20">

                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white text-center tracking-wider flex items-center justify-center gap-3">
                    <CheckCircleOutlined className="text-emerald-400" />
                    Kết Quả Phân Tích
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Ảnh */}
                    <div className="flex flex-col items-center">
                        <img
                            src={image}
                            alt="Lá cây"
                            className="w-full max-h-96 object-contain rounded-2xl shadow-xl border-4 border-emerald-500/50"
                        />
                        <p className="mt-3 text-sm text-gray-300">
                            Loại cây: <span className="font-bold text-emerald-400">
                                {leafType === 'corn' ? 'Lá Ngô' : 'Lá Xoài'}
                            </span>
                        </p>
                    </div>

                    {/* Kết quả */}
                    <div className="flex flex-col gap-6">
                        {numericConfidence >= 60 ? (
                            <>
                                <div className="p-6 rounded-2xl bg-black/40 shadow-inner border border-emerald-500/30">
                                    <p className="text-lg font-semibold text-gray-300 mb-2">Tình trạng lá:</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-emerald-400 mb-3">
                                        {displayLabel}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-300">Độ tin cậy:</span>
                                        <span className={`text-white font-bold px-4 py-1.5 rounded-full text-lg ${confidenceColor}`}>
                                            {confidenceDisplay}%
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-black/40 shadow-inner border border-yellow-500/30">
                                    <p className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                                        <WarningOutlined /> Khuyến nghị xử lý:
                                    </p>
                                    <p className="text-gray-200 leading-relaxed">
                                        {getAdvice()}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 rounded-2xl bg-red-900/50 shadow-inner border border-red-500/50 text-center">
                                <p className="text-xl font-bold text-red-300 mb-3">
                                    Độ tin cậy quá thấp ({confidenceDisplay}%)
                                </p>
                                <p className="text-gray-300">
                                    Không thể đưa ra kết luận chính xác. Vui lòng:
                                </p>
                                <ul className="text-left mt-3 text-sm text-gray-400 space-y-1">
                                    <li>• Chụp ảnh lá rõ nét, đầy đủ</li>
                                    <li>• Đảm bảo đúng loại cây đã chọn</li>
                                    <li>• Ánh sáng tốt, không mờ</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 flex justify-center">
                    <Button
                        onClick={() => navigate("/")}
                        type="primary"
                        size="large"
                        className="px-12 py-6 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Tải Ảnh Khác
                    </Button>
                </div>
            </div>
        </div>
    );
}