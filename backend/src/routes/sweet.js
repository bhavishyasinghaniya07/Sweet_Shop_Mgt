const express = require("express");
const {
  createSweet,
  getAllSweets,
  searchSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} = require("../controllers/sweetController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin"), createSweet);
router.get("/", protect, getAllSweets);
router.get("/search", protect, searchSweets);
router.get("/:id", protect, getSweetById);
router.put("/:id", protect, authorize("admin"), updateSweet);
router.delete("/:id", protect, authorize("admin"), deleteSweet);
router.post("/:id/purchase", protect, purchaseSweet);
router.post("/:id/restock", protect, authorize("admin"), restockSweet);

module.exports = router;
