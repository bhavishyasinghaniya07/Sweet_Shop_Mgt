const mongoose = require("mongoose");

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sweet name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if sweet is in stock
sweetSchema.methods.isInStock = function () {
  return this.quantity > 0;
};

// Method to purchase sweet
sweetSchema.methods.purchase = async function (quantity) {
  if (quantity > this.quantity) {
    throw new Error("Insufficient quantity");
  }
  this.quantity -= quantity;
  return await this.save();
};

// Method to restock sweet
sweetSchema.methods.restock = async function (quantity) {
  this.quantity += quantity;
  return await this.save();
};

module.exports = mongoose.model("Sweet", sweetSchema);
