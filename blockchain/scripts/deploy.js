import hre from "hardhat";

const { ethers } = await hre.network.connect();

const [admin] = await ethers.getSigners();

const PharmaChain = await ethers.getContractFactory("PharmaChain");

const pharmaChain = await PharmaChain.deploy(admin.address);

await pharmaChain.waitForDeployment();

console.log("PharmaChain deployed to:", await pharmaChain.getAddress());
console.log("Admin:", admin.address);
