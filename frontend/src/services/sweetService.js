import api from "./api";

const sweetService = {
  // Get all sweets
  getAllSweets: async () => {
    const response = await api.get("/sweets");
    return response.data;
  },

  // Get sweet by ID
  getSweetById: async (id) => {
    const response = await api.get(`/sweets/${id}`);
    return response.data;
  },

  // Search sweets
  searchSweets: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/sweets/search?${queryString}`);
    return response.data;
  },

  // Create new sweet (admin only)
  createSweet: async (sweetData) => {
    const response = await api.post("/sweets", sweetData);
    return response.data;
  },

  // Update sweet (admin only)
  updateSweet: async (id, sweetData) => {
    const response = await api.put(`/sweets/${id}`, sweetData);
    return response.data;
  },

  // Delete sweet (admin only)
  deleteSweet: async (id) => {
    const response = await api.delete(`/sweets/${id}`);
    return response.data;
  },

  // Purchase sweet
  purchaseSweet: async (id, quantity) => {
    const response = await api.post(`/sweets/${id}/purchase`, { quantity });
    return response.data;
  },

  // Restock sweet (admin only)
  restockSweet: async (id, quantity) => {
    const response = await api.post(`/sweets/${id}/restock`, { quantity });
    return response.data;
  },
};

export default sweetService;
