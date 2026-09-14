const { ethers } = require("ethers");
const User = require("../models/User");

const assignWallet = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return res.status(400).json({
                message: "Valid wallet address is required"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.walletAddress = walletAddress;
        await user.save();

        res.json({
            message: "Wallet address assigned successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to assign wallet address",
            error: error.message
        });
    }
};

module.exports = {
    assignWallet
};
