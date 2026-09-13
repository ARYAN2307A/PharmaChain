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
            enum: [
                "PENDING",
                "COMPLETED",
                "REJECTED"
            ],
            default: "PENDING"
        },

        initiatedAt: {
            type: Date,
            default: Date.now
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transfer", transferSchema);