import React, { useState, useEffect } from "react";
import sweetService from "../services/sweetService";
import SweetForm from "../components/SweetForm";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const Admin = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [restockId, setRestockId] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");

  const fetchSweets = async () => {
    try {
      const response = await sweetService.getAllSweets();
      setSweets(response.data.sweets);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sweets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleAddSweet = async (sweetData) => {
    try {
      await sweetService.createSweet(sweetData);
      setSuccess("Sweet added successfully!");
      setShowForm(false);
      fetchSweets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add sweet");
    }
  };

  const handleUpdateSweet = async (sweetData) => {
    try {
      await sweetService.updateSweet(editingSweet._id, sweetData);
      setSuccess("Sweet updated successfully!");
      setEditingSweet(null);
      setShowForm(false);
      fetchSweets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update sweet");
    }
  };

  const handleDeleteSweet = async (id) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await sweetService.deleteSweet(id);
        setSuccess("Sweet deleted successfully!");
        fetchSweets();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete sweet");
      }
    }
  };

  const handleRestock = async (id) => {
    const quantity = parseInt(restockQuantity);
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      await sweetService.restockSweet(id, quantity);
      setSuccess("Sweet restocked successfully!");
      setRestockId(null);
      setRestockQuantity("");
      fetchSweets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restock sweet");
    }
  };

  const handleEdit = (sweet) => {
    setEditingSweet(sweet);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSweet(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Manage your sweet inventory</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            {showForm ? "Cancel" : "+ Add New Sweet"}
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSweet ? "Edit Sweet" : "Add New Sweet"}
            </h2>
            <SweetForm
              sweet={editingSweet}
              onSubmit={editingSweet ? handleUpdateSweet : handleAddSweet}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sweets.map((sweet) => (
                  <tr key={sweet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sweet.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {sweet.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${sweet.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sweet.quantity > 10
                            ? "bg-green-100 text-green-800"
                            : sweet.quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sweet.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(sweet)}
                        className="text-blue-600 hover:text-blue-900 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSweet(sweet._id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Delete
                      </button>
                      {restockId === sweet._id ? (
                        <div className="inline-flex items-center space-x-2 mt-2">
                          <input
                            type="number"
                            value={restockQuantity}
                            onChange={(e) => setRestockQuantity(e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            min="1"
                          />
                          <button
                            onClick={() => handleRestock(sweet._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setRestockId(null);
                              setRestockQuantity("");
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRestockId(sweet._id)}
                          className="text-green-600 hover:text-green-900 transition"
                        >
                          Restock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sweets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No sweets in inventory
            </h3>
            <p className="text-gray-600">
              Click the "Add New Sweet" button to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
