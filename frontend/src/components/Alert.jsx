import React from "react";

const Alert = ({ type = "info", message, onClose }) => {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`${styles[type]} border rounded-lg p-4 mb-4 flex items-center justify-between animate-fadeIn`}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <span className="text-xl">×</span>
        </button>
      )}
    </div>
  );
};

export default Alert;
