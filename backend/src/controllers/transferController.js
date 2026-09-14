const Transfer = require("../models/Transfer");
const Batch = require("../models/Batch");
const User = require("../models/User");
const {
    contract,
    getContractForRole
} = require("../config/blockchain");
const { ethers } = require("ethers");

const createTransfer = async (req, res) => {
    try {
        const { batch, to } = req.body;

        const receiver = await User.findById(to);

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

        if (!receiver.walletAddress) {
            return res.status(400).json({
                message: "Receiver wallet address not assigned"
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

        const blockchainBatchId = ethers.id(batchData._id.toString());

        const senderContract = getContractForRole(req.user.role);

const tx = await senderContract.initiateHandover(
    blockchainBatchId,
    receiver.walletAddress
);

        await tx.wait();

        const transfer = await Transfer.create({
            batch,
            from: req.user.id,
            to
        });

        res.status(201).json({
            message: "Transfer initiated successfully",
            transfer,
            blockchain: {
                transactionHash: tx.hash,
                batchId: blockchainBatchId
            }
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

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const receiver = await User.findById(transfer.to);

        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        }

        const receiverContract = getContractForRole(receiver.role);

        const signerAddress = await receiverContract.runner.getAddress();

        if (
            signerAddress.toLowerCase() !==
            receiver.walletAddress.toLowerCase()
        ) {
            return res.status(400).json({
                message: "Receiver wallet does not match blockchain signer"
            });
        }

        const blockchainBatchId = ethers.id(batch._id.toString());

        const tx = await receiverContract.confirmHandover(
            blockchainBatchId
        );

        await tx.wait();

        batch.currentOwner = transfer.to;
        batch.lifecycleState = "RECEIVED";

        await batch.save();

        transfer.status = "COMPLETED";
        transfer.completedAt = new Date();

        await transfer.save();

        res.json({
            message: "Transfer completed successfully",
            transfer,
            batch,
            blockchain: {
                transactionHash: tx.hash,
                batchId: blockchainBatchId,
                confirmedBy: signerAddress
            }
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