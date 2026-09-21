const QRCode = require("qrcode");

const generateBatchQR = async (batchId) => {
    return await QRCode.toDataURL(
        `http://localhost:5173/verify?batch=${batchId}`
    );
};

module.exports = generateBatchQR;