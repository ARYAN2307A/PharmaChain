const express = require("express");

const { assignWallet } = require("../controllers/walletController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.put("/:id/wallet", protect, adminOnly, assignWallet);

module.exports = router;
