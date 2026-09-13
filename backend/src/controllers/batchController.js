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

module.exports = {
    createBatch,
    getBatches
};