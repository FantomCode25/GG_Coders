import React, { useState } from "react";

export default function CropCardCustomer({ id, name, emoji, color, price }) {
    const [quantity, setQuantity] = useState(0);

    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer" style={{ backgroundColor: color }}>
            <div className="text-3xl">{emoji}</div>
            <h4 className="font-bold text-lg">{name}</h4>
            <p className="text-sm text-gray-500">Price: ₹{price} / kg</p>

            <div className="flex items-center gap-2 mt-2 stopPropagation">
                <button
                    className="px-3 py-1 bg-gray-200 rounded text-lg"
                    onClick={(e) => {
                        setQuantity(Math.max(0, quantity - 1));
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >-</button>
                <span>{quantity}</span>
                <button
                    className="px-3 py-1 bg-gray-200 rounded text-lg"
                    onClick={(e) => {
                        setQuantity(quantity + 1);
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >+</button>
            </div>
        </div>
    );
}
