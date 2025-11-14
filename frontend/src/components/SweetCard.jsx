import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import sweetService from "../services/sweetService";
import Alert from "./Alert";

const SweetCard = ({ sweet, onUpdate, onDelete }) => {
  const { isAdmin } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState(null);

  const handlePurchase = async () => {
    if (quantity > sweet.quantity) {
      setAlert({ type: "error", message: "Not enough stock available" });
      return;
    }

    setPurchasing(true);
    try {
      await sweetService.purchaseSweet(sweet._id, quantity);
      setAlert({ type: "success", message: "Purchase successful!" });
      setQuantity(1);
      if (onUpdate) onUpdate();
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Purchase failed",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await sweetService.deleteSweet(sweet._id);
        setAlert({ type: "success", message: "Sweet deleted successfully" });
        if (onDelete) onDelete(sweet._id);
      } catch (error) {
        setAlert({
          type: "error",
          message: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
      {alert && (
        <div className="p-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl">🍭</span>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{sweet.name}</h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              sweet.quantity > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {sweet.quantity > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">{sweet.category}</p>

        {sweet.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {sweet.description}
          </p>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary-600">
            ${sweet.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-600">Stock: {sweet.quantity}</span>
        </div>

        {!isAdmin() ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Qty:</label>
              <input
                type="number"
                min="1"
                max={sweet.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={sweet.quantity === 0}
              />
            </div>
            <button
              onClick={handlePurchase}
              disabled={sweet.quantity === 0 || purchasing}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {purchasing ? "Processing..." : "Purchase"}
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdate(sweet)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SweetCard;
