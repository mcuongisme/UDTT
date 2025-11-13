import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { predictImage } from "../ultils/CallApi";

const { Option } = Select;

export default function UploadPage() {
    const [image, setImage] = useState(null);
    const [leafType, setLeafType] = useState("corn");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!image) return alert("Hãy chọn ảnh trước!");
        if (!leafType) return alert("Hãy chọn loại lá!");

        setIsLoading(true);

        try {
            const data = await predictImage(image, leafType);

            const resultData = {
                label: data.prediction,
                confidence: data.confidence,
                leafType: leafType,
            };

            navigate("/result", {
                state: { data: resultData, image: URL.createObjectURL(image) },
            });
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl m-3 flex flex-col gap-3 md:p-8 max-w-xl w-full border border-white/20">
                <div className="flex flex-col items-center text-center gap-5">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-wider">
                        Hệ thống AI nhận diện bệnh trên lá cây
                    </h1>
                    <p className="text-xl text-gray-200 max-w-md font-light">
                        Tải ảnh chất lượng cao của cây trồng lên để được chẩn đoán tức thì.
                    </p>
                </div>

                <form onSubmit={handleUpload} className="flex flex-col items-center w-full space-y-4">

                    {/* Dropdown chọn loại lá */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Chọn loại lá
                        </label>
                        <Select
                            value={leafType}
                            onChange={setLeafType}
                            className="w-full"
                            size="large"
                            placeholder="Chọn loại cây"
                        >
                            <Option value="" disabled>--Chọn loại cây--</Option>
                            <Option value="corn">Lá Ngô (Corn)</Option>
                            <Option value="mango">Lá Xoài (Mango)</Option>
                        </Select>
                    </div>

                    {/* Upload ảnh */}
                    <label htmlFor="file-upload" className="w-full cursor-pointer">
                        <div className={`flex flex-col items-center justify-center h-48 border-4 border-dashed rounded-xl transition duration-300 ${image ? 'border-green-400 bg-black/40' : 'border-green-500/70 bg-black/30 hover:bg-black/40 hover:border-green-400'}`}>
                            <svg className="w-12 h-12 text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            <p className="text-lg text-white font-semibold">Tải ảnh</p>
                            <p className="text-sm text-gray-400 mt-1">JPG, PNG (Tối đa 5MB)</p>
                        </div>
                    </label>

                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="hidden"
                    />

                    {/* Preview ảnh */}
                    {image && (
                        <div className="flex flex-col items-center mt-2 gap-2 w-full">
                            <img
                                src={URL.createObjectURL(image)}
                                alt="preview"
                                className="max-h-64 rounded-lg shadow-lg object-contain"
                            />
                            <div className="text-sm text-green-400 p-2 bg-black/20 rounded-lg w-full text-center">
                                Đã chọn: {image.name}
                            </div>
                        </div>
                    )}

                    {/* Nút dự đoán */}
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={!image || !leafType || isLoading}
                        icon={<SearchOutlined />}
                        loading={isLoading}
                        size="large"
                        className="w-full mt-4"
                    >
                        {isLoading ? "Đang dự đoán..." : "Dự đoán ngay"}
                    </Button>
                </form>
            </div>
        </div>
    );
}