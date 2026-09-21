const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const ROLE_WALLETS = {
            MANUFACTURER: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            DISTRIBUTOR: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            WAREHOUSE: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            PHARMACY: "0x90F79bf6EB2c4f670360E1ED71607002461D3ED3",
            ADMIN: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            walletAddress: ROLE_WALLETS[role] || ROLE_WALLETS.PHARMACY
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
    console.error(error);

    res.status(500).json({
        message: "Registration failed",
        error: error.message
    });
}
};

module.exports = {
    registerUser,
    loginUser
};
