const QRCode = require("qrcode");

const generateBatchQR = async (batchId) => {
    return await QRCode.toDataURL(
        `http://localhost:5000/api/batches/${batchId}/verify`
    );
};

module.exports = generateBatchQR;