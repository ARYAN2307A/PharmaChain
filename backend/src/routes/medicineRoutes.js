const express = require("express");

const {
    createMedicine,
    getMedicines
} = require("../controllers/medicineController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMedicine);
router.get("/", protect, getMedicines);

module.exports = router;