const QRCode = require("qrcode");

const generateBatchQR = async (batchId) => {
    return await QRCode.toDataURL(
        `http://192.168.137.1:5000/api/batches/${batchId}/verify`
    );
};

module.exports = generateBatchQR;