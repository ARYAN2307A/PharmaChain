const Batch = require("../models/Batch");
const Medicine = require("../models/Medicine");
const mongoose = require("mongoose");
const generateBatchQR = require("../utils/qrGenerator");
const { contract } = require("../config/blockchain");
const { ethers } = require("ethers");
const Transfer = require("../models/Transfer");
const createBatch = async (req, res) => {
    let batch;
    try {
        batch = await Batch.create({
            ...req.body,
            manufacturer: req.user.id,
            currentOwner: req.user.id
        });

        const batchId = ethers.id(batch._id.toString());
        const medicineId = ethers.id(batch.medicine.toString());
        const expiryTimestamp = Math.floor(
            new Date(batch.expiryDate).getTime() / 1000
        );

        const tx = await contract.registerBatch(
            batchId,
            medicineId,
            batch.quantity,
            expiryTimestamp
        );

        await tx.wait();

        res.status(201).json({
            message: "Batch created successfully",
            batch,
            blockchain: {
                transactionHash: tx.hash,
                batchId
            }
        });
    } catch (error) {
        if (batch && batch._id) {
            await Batch.findByIdAndDelete(batch._id).catch(() => {});
        }
        res.status(500).json({
            message: "Failed to create batch",
            error: error.message
        });
    }
};

const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find({
            $or: [
                { manufacturer: req.user.id },
                { currentOwner: req.user.id }
            ]
        })
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
        let batch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            batch = await Batch.findById(req.params.id)
                .populate("medicine")
                .populate("manufacturer", "name email role")
                .populate("currentOwner", "name email role");
        }

        if (!batch) {
            batch = await Batch.findOne({ batchNumber: req.params.id })
                .populate("medicine")
                .populate("manufacturer", "name email role")
                .populate("currentOwner", "name email role");
        }

        if (!batch) {
            return res.status(404).json({
                verified: false,
                message: "Batch not found"
            });
        }

        const blockchainBatchId = ethers.id(batch._id.toString());

        const [
            exists,
            valid,
            expired,
            status,
            lifecycle,
            currentOwner,
            expiryTimestamp
        ] = await contract.verifyBatch(blockchainBatchId);

        if (!exists) {
            return res.json({
                verified: false,
                reason: "Batch does not exist on blockchain",
                batch
            });
        }

        const lifecycleMap = [
            "CREATED",
            "DISPATCHED",
            "IN_TRANSIT",
            "RECEIVED",
            "AT_PHARMACY",
            "SOLD"
        ];

        const blockchainLifecycle = lifecycleMap[Number(lifecycle)];

        if (!valid) {
            return res.json({
                verified: false,
                reason: expired
                    ? "Batch has expired on blockchain"
                    : batch.status === "RECALLED" || Number(status) === 1
                    ? "Batch has been RECALLED on blockchain"
                    : "Batch is not active on blockchain",
                batch,
                blockchain: {
                    batchId: blockchainBatchId,
                    valid,
                    expired,
                    status: Number(status),
                    lifecycle: blockchainLifecycle,
                    currentOwner,
                    expiryTimestamp: Number(expiryTimestamp)
                }
            });
        }

        if (blockchainLifecycle !== batch.lifecycleState) {
            return res.json({
                verified: false,
                reason: "Blockchain and database lifecycle mismatch",
                databaseLifecycle: batch.lifecycleState,
                blockchainLifecycle
            });
        }

        res.json({
            verified: true,
            message: "Batch verified successfully on blockchain",
            batch,
            blockchain: {
                batchId: blockchainBatchId,
                valid,
                expired,
                status: Number(status),
                lifecycle: blockchainLifecycle,
                currentOwner,
                expiryTimestamp: Number(expiryTimestamp)
            }
        });

    } catch (error) {
        res.status(500).json({
            verified: false,
            message: "Blockchain verification failed",
            error: error.message
        });
    }
};

const recallBatch = async (req, res) => {
    try {
        let batch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            batch = await Batch.findById(req.params.id);
        }
        if (!batch) {
            batch = await Batch.findOne({ batchNumber: req.params.id });
        }

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const blockchainBatchId = ethers.id(batch._id.toString());

        const tx = await contract.recallBatch(blockchainBatchId);

        await tx.wait();

        batch.status = "RECALLED";
        await batch.save();

        res.json({
            message: "Batch recalled successfully",
            batch,
            blockchain: {
                transactionHash: tx.hash,
                batchId: blockchainBatchId
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to recall batch",
            error: error.message
        });
    }
};

const restoreBatch = async (req, res) => {
    try {
        let batch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            batch = await Batch.findById(req.params.id);
        }
        if (!batch) {
            batch = await Batch.findOne({ batchNumber: req.params.id });
        }

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const blockchainBatchId = ethers.id(batch._id.toString());

        const tx = await contract.restoreBatch(blockchainBatchId);

        await tx.wait();

        batch.status = "ACTIVE";
        await batch.save();

        res.json({
            message: "Batch restored successfully",
            batch,
            blockchain: {
                transactionHash: tx.hash,
                batchId: blockchainBatchId
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to restore batch",
            error: error.message
        });
    }
};

const getBatchQR = async (req, res) => {
    try {
        let batch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            batch = await Batch.findById(req.params.id);
        }
        if (!batch) {
            batch = await Batch.findOne({ batchNumber: req.params.id });
        }

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const qrCode = await generateBatchQR(batch.batchNumber);

        res.json({
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            qrCode
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate QR code",
            error: error.message
        });
    }
};  

const updateLifecycle = async (req, res) => {
    try {
        const { lifecycleState } = req.body;

        const lifecycleMap = {
            CREATED: 0,
            DISPATCHED: 1,
            IN_TRANSIT: 2,
            RECEIVED: 3,
            AT_PHARMACY: 4,
            SOLD: 5
        };

        if (!(lifecycleState in lifecycleMap)) {
            return res.status(400).json({
                message: "Invalid lifecycle state"
            });
        }

        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        if (batch.currentOwner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the current owner can update lifecycle"
            });
        }

        const blockchainBatchId = ethers.id(batch._id.toString());

        const { getContractForRole } = require("../config/blockchain");

        const senderContract = getContractForRole(req.user.role);

        const tx = await senderContract.updateLifecycle(
            blockchainBatchId,
            lifecycleMap[lifecycleState]
        );

        await tx.wait();

        batch.lifecycleState = lifecycleState;
        await batch.save();

        res.json({
            message: "Lifecycle updated successfully",
            batch,
            blockchain: {
                transactionHash: tx.hash,
                batchId: blockchainBatchId
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update lifecycle",
            error: error.message
        });
    }
};

const getMedicinePassport = async (req, res) => {
    try {
        const idParam = req.params.id;
        let medicine = null;
        let batch = null;
        let batches = [];

        if (mongoose.Types.ObjectId.isValid(idParam)) {
            medicine = await Medicine.findById(idParam);
            if (medicine) {
                batches = await Batch.find({ medicine: medicine._id })
                    .populate("manufacturer", "name email role walletAddress")
                    .populate("currentOwner", "name email role walletAddress")
                    .sort({ createdAt: -1 });
                if (batches.length > 0) {
                    batch = batches[0]; // most recent as the "primary" batch
                }
            } else {
                batch = await Batch.findById(idParam)
                    .populate("medicine")
                    .populate("manufacturer", "name email role walletAddress")
                    .populate("currentOwner", "name email role walletAddress");
            }
        }

        if (!batch && !medicine) {
            batch = await Batch.findOne({ batchNumber: idParam })
                .populate("medicine")
                .populate("manufacturer", "name email role walletAddress")
                .populate("currentOwner", "name email role walletAddress");
        }

        if (!medicine && batch && batch.medicine) {
            medicine = batch.medicine;
            if (batches.length === 0) batches = [batch];
        }

        if (!medicine && !batch) {
            return res.status(404).json({
                message: "Medicine passport not found"
            });
        }

        // Fetch all batch IDs for this medicine
        const batchIds = batches.map(b => b._id);

        // Aggregate transfers across all batches
        let transfers = [];
        if (batchIds.length > 0) {
            transfers = await Transfer.find({ batch: { $in: batchIds } })
                .populate("from", "name email role")
                .populate("to", "name email role")
                .populate({ path: "batch", select: "batchNumber" })
                .sort({ createdAt: 1 });
        } else if (batch) {
            transfers = await Transfer.find({ batch: batch._id })
                .populate("from", "name email role")
                .populate("to", "name email role")
                .sort({ createdAt: 1 });
        }

        // Blockchain verification for the primary (most recent) batch
        let blockchain = { valid: false, reason: "No active batch on blockchain" };
        let blockchainSummary = [];

        if (batch) {
            try {
                const blockchainBatchId = ethers.id(batch._id.toString());
                const [exists, valid, expired, status, lifecycle, currentOwner, expiryTimestamp] =
                    await contract.verifyBatch(blockchainBatchId);
                const lifecycleMap = ["CREATED", "DISPATCHED", "IN_TRANSIT", "RECEIVED", "AT_PHARMACY", "SOLD"];
                blockchain = {
                    exists,
                    valid,
                    expired,
                    status: Number(status),
                    lifecycle: lifecycleMap[Number(lifecycle)] || "CREATED",
                    currentOwner,
                    expiryTimestamp: Number(expiryTimestamp),
                    batchNumber: batch.batchNumber
                };
            } catch (err) {
                blockchain = { valid: false, error: err.message };
            }
        }

        // Blockchain verification summary across all batches
        for (const b of batches) {
            try {
                const blockchainBatchId = ethers.id(b._id.toString());
                const [exists, valid, expired] = await contract.verifyBatch(blockchainBatchId);
                blockchainSummary.push({
                    batchId: b._id,
                    batchNumber: b.batchNumber,
                    exists,
                    valid,
                    expired
                });
            } catch {
                blockchainSummary.push({
                    batchId: b._id,
                    batchNumber: b.batchNumber,
                    exists: false,
                    valid: false,
                    expired: false
                });
            }
        }

        res.json({
            passport: {
                medicine,
                batch: batch || { batchNumber: "N/A", status: "N/A", quantity: 0 },
                batches,
                transfers
            },
            blockchain,
            blockchainSummary
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate medicine passport",
            error: error.message
        });
    }
};

module.exports = {
    createBatch,
    getBatches,
    verifyBatch,
    recallBatch,
    restoreBatch,
    getBatchQR,
    updateLifecycle,
    getMedicinePassport
};