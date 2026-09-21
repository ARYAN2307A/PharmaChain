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

const contractAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";


const contract = new ethers.Contract(
    contractAddress,
    contractArtifact.abi,
    wallet
);

const getSignerForRole = (role) => {
    let privateKey;

    if (role === "MANUFACTURER" || role === "ADMIN") {
        privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    } else if (role === "DISTRIBUTOR") {
        privateKey = process.env.HARDHAT_DISTRIBUTOR_PRIVATE_KEY;
    } else if (role === "WAREHOUSE") {
        privateKey = process.env.HARDHAT_WAREHOUSE_PRIVATE_KEY || "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
    } else if (role === "PHARMACY") {
        privateKey = process.env.HARDHAT_PHARMACY_PRIVATE_KEY || "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
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