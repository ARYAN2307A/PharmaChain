const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "ADMIN",
                "MANUFACTURER",
                "DISTRIBUTOR",
                "PHARMACY"
            ],
            default: "PHARMACY"
        },

        walletAddress: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    match: /^0x[a-fA-F0-9]{40}$/
}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);