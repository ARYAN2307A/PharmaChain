import hre from "hardhat";

const { ethers } = await hre.network.connect();

const signers = await ethers.getSigners();
const admin = signers[0];
const distributor = signers[1];
const warehouse = signers[2];
const pharmacy = signers[3];

const PharmaChain = await ethers.getContractFactory("PharmaChain");

const pharmaChain = await PharmaChain.deploy(admin.address);

await pharmaChain.waitForDeployment();

console.log("PharmaChain deployed to:", await pharmaChain.getAddress());
console.log("Admin:", admin.address);

// Grant roles to backend signers
console.log("Granting roles...");
await (await pharmaChain.grantManufacturerRole(admin.address)).wait();
await (await pharmaChain.grantDistributorRole(distributor.address)).wait();
await (await pharmaChain.grantWarehouseRole(warehouse.address)).wait();
await (await pharmaChain.grantPharmacyRole(pharmacy.address)).wait();
console.log("All roles granted successfully!");
