    const express = require("express");

    const {
        createTransfer,
        completeTransfer,
        getBatchTransfers,
        getTransfers,
        getReceivers
    } = require("../controllers/transferController");

    const protect = require("../middleware/authMiddleware");

    const router = express.Router();

    router.get("/", protect, getTransfers);
    router.get("/receivers", protect, getReceivers);
    router.post("/", protect, createTransfer);
    router.put("/:id/complete", protect, completeTransfer);
    router.get("/batch/:batchId", protect, getBatchTransfers);

    module.exports = router;