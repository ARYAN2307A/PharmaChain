const Transfer = require("../models/Transfer");
const Batch = require("../models/Batch");

const createTransfer = async (req, res) => {
    try {
        const { batch, to } = req.body;
        const receiver = await require("../models/User").findById(to);

if (!receiver) {
    return res.status(404).json({
        message: "Receiver not found"
    });
}

if (!["DISTRIBUTOR", "WAREHOUSE", "PHARMACY"].includes(receiver.role)) {
    return res.status(400).json({
        message: "Invalid receiver role"
    });
}

        const batchData = await Batch.findById(batch);

        if (!batchData) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        if (batchData.currentOwner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the current owner can transfer this batch"
            });
        }

        const transfer = await Transfer.create({
            batch,
            from: req.user.id,
            to
        });

        res.status(201).json({
            message: "Transfer initiated successfully",
            transfer
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create transfer",
            error: error.message
        });
    }
};

const completeTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({
                message: "Transfer not found"
            });
        }

        if (transfer.to.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the receiver can complete this transfer"
            });
        }

        if (transfer.status !== "PENDING") {
            return res.status(400).json({
                message: "Transfer is not pending"
            });
        }

        const batch = await Batch.findById(transfer.batch);

        batch.currentOwner = req.user.id;
        batch.lifecycleState = "RECEIVED";

        await batch.save();

        transfer.status = "COMPLETED";
        transfer.completedAt = new Date();

        await transfer.save();

        res.json({
            message: "Transfer completed successfully",
            transfer,
            batch
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to complete transfer",
            error: error.message
        });
    }
};

const getBatchTransfers = async (req, res) => {
    try {
        const transfers = await Transfer.find({
            batch: req.params.batchId
        })
            .populate("from", "name email role")
            .populate("to", "name email role")
            .sort({ createdAt: 1 });

        res.json(transfers);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transfer history",
            error: error.message
        });
    }
};

module.exports = {
    createTransfer,
    completeTransfer,
    getBatchTransfers
};