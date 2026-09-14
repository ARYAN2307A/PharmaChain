    const express = require("express");

    const {
        createTransfer,
        completeTransfer,
        getBatchTransfers
    } = require("../controllers/transferController");

    const protect = require("../middleware/authMiddleware");

    const router = express.Router();

    router.post("/", protect, createTransfer);
    router.put("/:id/complete", protect, completeTransfer);
    router.get("/batch/:batchId", protect, getBatchTransfers);

    module.exports = router;