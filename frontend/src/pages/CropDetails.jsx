import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import { dummyCrops } from "../data/dummyCrops.js";

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:5000";

export default function CropDetails() {
    const { cropId } = useParams();
    const crop = dummyCrops.find(c => c.id === cropId);

    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        async function fetchCropDetails() {
          try {
            // Fetch crops
            const cropRes = await fetch(
              `${BACKEND_URL}/api/marketPlace/farmer/getCrop`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                  "Content-Type": "application/json",
                  body: JSON.stringify({ cropName: cropId }),
                },
              }
            );
            const cropJson = await cropRes.json();
            // setCrops(cropJson.farmerCrops || []);
    

            console.log(cropJson);
          } catch (err) {
            console.error("Error loading dashboard data", err);
          }
        }
        fetchCropDetails();
      }, []);
    

    const handleUpload = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/marketPlace/farmer/uploadCrop`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cropId,
                    cropQuantity: quantity,
                    cropPrice: price,
                }),
            });

            const data = await response.json();
            console.log("Upload Response:", data);
            alert("Crop uploaded successfully!");

            setQuantity("");
            setPrice("");
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to upload crop.");
        }
    };

    if (!crop) return <p className="p-8">Loading...</p>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />

                <main className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Crop Info Card */}
                    <div className="bg-white rounded-2xl p-6 shadow col-span-1 xl:col-span-1">
                        <h2 className="text-xl font-semibold mb-4">Crop Information</h2>
                        <input defaultValue={crop.name} placeholder="Crop Name" className="border p-2 w-full mb-2 rounded" />
                        <input placeholder="Field Size (sown area)" className="border p-2 w-full mb-2 rounded" />
                        <input placeholder="Expected Price" className="border p-2 w-full mb-4 rounded" />
                        <button className="bg-green-600 text-white rounded py-2 w-full">Save Data</button>
                    </div>

                    {/* Rain Shower Prediction */}
                    <div className="bg-white rounded-2xl p-6 shadow col-span-1 xl:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Rain shower prediction</h2>
                        <div className="bg-gray-100 h-52 rounded flex items-center justify-center text-gray-500">Chart Placeholder</div>
                    </div>

                    {/* Irrigation Schedule */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-semibold mb-4">Irrigation Schedule</h2>
                        <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">Chart Placeholder</div>
                    </div>

                    {/* Time to Harvest */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-semibold mb-4">Time to harvest</h2>
                        <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">Chart Placeholder</div>
                    </div>

                    {/* Expected Harvest */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-semibold mb-4">Expected harvest</h2>
                        <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">Chart Placeholder</div>
                    </div>

                    {/* Pesticide/Fertilizer Schedule */}
                    <div className="bg-white rounded-2xl p-6 shadow col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Pesticide / Fertilizer Schedule</h2>
                        <ul className="space-y-2">
                            <li className="flex justify-between"><span>Neem Oil</span><span>45%</span></li>
                            <li className="flex justify-between"><span>Urea Fertilizer</span><span>29%</span></li>
                            <li className="flex justify-between"><span>Compost Mix</span><span>18%</span></li>
                            <li className="flex justify-between"><span>Potash Blend</span><span>25%</span></li>
                        </ul>
                    </div>

                    {/* Farm Guide */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-semibold mb-4">Farm Guide</h2>
                        <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">Chart Placeholder</div>
                    </div>

                    {/* Upload to Marketplace */}
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-xl font-semibold mb-4">Upload Crop to Marketplace</h2>
                        <input
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Crop Quantity in kg"
                            className="border p-2 w-full mb-4 rounded"
                        />
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Crop Price"
                            className="border p-2 w-full mb-4 rounded"
                        />
                        <button
                            onClick={handleUpload}
                            className="bg-blue-600 hover:bg-blue-700 transition text-white rounded py-2 w-full"
                        >
                            Upload Data
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
