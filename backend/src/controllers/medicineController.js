const Medicine = require("../models/Medicine");

const createMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.create(req.body);

        res.status(201).json({
            message: "Medicine created successfully",
            medicine
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create medicine",
            error: error.message
        });
    }
};

const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();

        res.json(medicines);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch medicines",
            error: error.message
        });
    }
};

module.exports = {
    createMedicine,
    getMedicines
};