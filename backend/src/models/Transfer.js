const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "CANCELLED"],
            default: "PENDING"
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transfer", transferSchema);