require("dotenv").config();

const { ethers } = require("ethers");

const contractArtifact = require("../../../blockchain/artifacts/contracts/PharmaChain.sol/PharmaChain.json");

const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
);

const contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";


const contract = new ethers.Contract(
    contractAddress,
    contractArtifact.abi,
    wallet
);

const getSignerForRole = (role) => {
    let privateKey;

    if (role === "MANUFACTURER") {
    privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
} else if (role === "DISTRIBUTOR") {
    privateKey = process.env.HARDHAT_DISTRIBUTOR_PRIVATE_KEY;
} else if (role === "PHARMACY") {
    privateKey = process.env.HARDHAT_PHARMACY_PRIVATE_KEY;
} else {
        throw new Error(`No signer configured for role: ${role}`);
    }

    if (!privateKey) {
        throw new Error(`Private key not configured for role: ${role}`);
    }

    return new ethers.Wallet(privateKey, provider);
};

const getContractForRole = (role) => {
    const signer = getSignerForRole(role);

    return new ethers.Contract(
        contractAddress,
        contractArtifact.abi,
        signer
    );
};

module.exports = {
    provider,
    wallet,
    contract,
    getSignerForRole,
    getContractForRole
};