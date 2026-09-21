const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB Atlas connection failed:", error.message);
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;