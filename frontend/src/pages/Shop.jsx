import React, { useState, useEffect } from "react";
import sweetService from "../services/sweetService";
import SweetCard from "../components/SweetCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const Shop = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSweets = async (searchParams = {}) => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (Object.keys(searchParams).length > 0) {
        response = await sweetService.searchSweets(searchParams);
      } else {
        response = await sweetService.getAllSweets();
      }
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

  const handleSearch = (searchParams) => {
    fetchSweets(searchParams);
  };

  const handleSweetUpdate = () => {
    fetchSweets();
  };

  const handleSweetDelete = (deletedId) => {
    setSweets((prev) => prev.filter((sweet) => sweet._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍬 Sweet Shop
          </h1>
          <p className="text-gray-600">
            Discover our delicious collection of sweets
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="xl" />
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No sweets found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters or check back later
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Found {sweets.length} sweet{sweets.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sweets.map((sweet) => (
                <SweetCard
                  key={sweet._id}
                  sweet={sweet}
                  onUpdate={handleSweetUpdate}
                  onDelete={handleSweetDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
