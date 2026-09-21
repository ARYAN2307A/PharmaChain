const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        genericName: {
            type: String,
            trim: true
        },

        manufacturer: {
            type: String,
            trim: true
        },

        dosageForm: {
            type: String,
            trim: true,
            default: "Tablet"
        },

        strength: {
            type: String,
            trim: true,
            default: "Standard"
        },

        category: {
            type: String,
            trim: true
        },

        dosage: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Medicine", medicineSchema);