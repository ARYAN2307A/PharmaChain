const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
    {
        batchNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            required: true
        },

        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        manufacturingDate: {
            type: Date,
            required: true
        },

        expiryDate: {
            type: Date,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        currentOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "RECALLED",
                "SUSPENDED",
                "EXPIRED"
            ],
            default: "ACTIVE"
        },

        lifecycleState: {
            type: String,
            enum: [
                "CREATED",
                "DISPATCHED",
                "IN_TRANSIT",
                "RECEIVED",
                "AT_PHARMACY",
                "SOLD"
            ],
            default: "CREATED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Batch", batchSchema);