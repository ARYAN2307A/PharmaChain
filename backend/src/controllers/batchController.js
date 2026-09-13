const Batch = require("../models/Batch");

const createBatch = async (req, res) => {
    try {
        const batch = await Batch.create({
            ...req.body,
            manufacturer: req.user.id,
            currentOwner: req.user.id
        });

        res.status(201).json({
            message: "Batch created successfully",
            batch
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create batch",
            error: error.message
        });
    }
};

const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate("medicine")
            .populate("manufacturer", "name email role")
            .populate("currentOwner", "name email role");

        res.json(batches);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch batches",
            error: error.message
        });
    }
};

const verifyBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate("medicine")
            .populate("manufacturer", "name email role")
            .populate("currentOwner", "name email role");

        if (!batch) {
            return res.status(404).json({
                verified: false,
                message: "Batch not found"
            });
        }

        const now = new Date();

        if (batch.status === "RECALLED") {
            return res.json({
                verified: false,
                reason: "Batch has been recalled",
                batch
            });
        }

        if (batch.status === "SUSPENDED") {
            return res.json({
                verified: false,
                reason: "Batch is suspended",
                batch
            });
        }

        if (now > batch.expiryDate) {
            return res.json({
                verified: false,
                reason: "Batch has expired",
                batch
            });
        }

        res.json({
            verified: true,
            message: "Batch is valid",
            batch
        });
    } catch (error) {
        res.status(500).json({
            verified: false,
            message: "Batch verification failed",
            error: error.message
        });
    }
};

const recallBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        batch.status = "RECALLED";
        await batch.save();

        res.json({
            message: "Batch recalled successfully",
            batch
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to recall batch",
            error: error.message
        });
    }
};

module.exports = {
    createBatch,
    getBatches,
    verifyBatch,
    recallBatch
};