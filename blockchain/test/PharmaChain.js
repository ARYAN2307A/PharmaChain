import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("PharmaChain", function () {
    let pharmaChain;
    let admin;
    let manufacturer;
    let distributor;
    let warehouse;
    let pharmacy;
    let randomUser;

    const batchId = ethers.keccak256(
        ethers.toUtf8Bytes("BATCH-001")
    );

    const medicineId = ethers.keccak256(
        ethers.toUtf8Bytes("MEDICINE-001")
    );

    async function futureExpiry() {
        const block = await ethers.provider.getBlock("latest");
        return Number(block.timestamp) + 86400 * 365;
    }

    async function expectRevert(promise, message) {
        try {
            await promise;
            expect.fail("Expected transaction to revert");
        } catch (error) {
            expect(error.message).to.include(message);
        }
    }

    beforeEach(async function () {
        [
            admin,
            manufacturer,
            distributor,
            warehouse,
            pharmacy,
            randomUser
        ] = await ethers.getSigners();

        const PharmaChain =
            await ethers.getContractFactory("PharmaChain");

        pharmaChain =
            await PharmaChain.deploy(admin.address);

        await pharmaChain.waitForDeployment();

        await pharmaChain
            .connect(admin)
            .grantManufacturerRole(manufacturer.address);

        await pharmaChain
            .connect(admin)
            .grantDistributorRole(distributor.address);

        await pharmaChain
            .connect(admin)
            .grantWarehouseRole(warehouse.address);

        await pharmaChain
            .connect(admin)
            .grantPharmacyRole(pharmacy.address);
    });

    describe("Deployment", function () {

        it("should assign admin role", async function () {
            const ADMIN_ROLE =
                await pharmaChain.ADMIN_ROLE();

            expect(
                await pharmaChain.hasRole(
                    ADMIN_ROLE,
                    admin.address
                )
            ).to.equal(true);
        });

    });

    describe("Batch Registration", function () {

        it("should allow manufacturer to register a batch", async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.batchId).to.equal(batchId);
            expect(batch.medicineId).to.equal(medicineId);
            expect(batch.manufacturer)
                .to.equal(manufacturer.address);
            expect(batch.currentOwner)
                .to.equal(manufacturer.address);
            expect(batch.quantity).to.equal(1000n);
            expect(batch.exists).to.equal(true);
            expect(batch.status).to.equal(0n);
            expect(batch.lifecycle).to.equal(0n);
        });

        it("should reject unauthorized batch creation", async function () {
            const expiry = await futureExpiry();

            await expectRevert(
                pharmaChain
                    .connect(randomUser)
                    .registerBatch(
                        batchId,
                        medicineId,
                        1000,
                        expiry
                    ),
                "AccessControl"
            );
        });

        it("should reject duplicate batch IDs", async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );

            await expectRevert(
                pharmaChain
                    .connect(manufacturer)
                    .registerBatch(
                        batchId,
                        medicineId,
                        500,
                        expiry
                    ),
                "Batch already exists"
            );
        });

    });

    describe("Handover", function () {

        beforeEach(async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );
        });

        it("should initiate a handover", async function () {
            await pharmaChain
                .connect(manufacturer)
                .initiateHandover(
                    batchId,
                    distributor.address
                );

            const pending =
                await pharmaChain.getPendingHandover(batchId);

            expect(pending.from)
                .to.equal(manufacturer.address);

            expect(pending.to)
                .to.equal(distributor.address);

            expect(pending.exists)
                .to.equal(true);

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.currentOwner)
                .to.equal(manufacturer.address);

            expect(batch.lifecycle).to.equal(1n);
        });

        it("should not change owner before confirmation", async function () {
            await pharmaChain
                .connect(manufacturer)
                .initiateHandover(
                    batchId,
                    distributor.address
                );

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.currentOwner)
                .to.equal(manufacturer.address);
        });

        it("should allow receiver to confirm handover", async function () {
            await pharmaChain
                .connect(manufacturer)
                .initiateHandover(
                    batchId,
                    distributor.address
                );

            await pharmaChain
                .connect(distributor)
                .confirmHandover(batchId);

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.currentOwner)
                .to.equal(distributor.address);

            expect(batch.lifecycle).to.equal(3n);

            const pending =
                await pharmaChain.getPendingHandover(batchId);

            expect(pending.exists)
                .to.equal(false);
        });

        it("should reject confirmation by wrong receiver", async function () {
            await pharmaChain
                .connect(manufacturer)
                .initiateHandover(
                    batchId,
                    distributor.address
                );

            await expectRevert(
                pharmaChain
                    .connect(warehouse)
                    .confirmHandover(batchId),
                "Only receiver can confirm"
            );
        });

        it("should record transfer history", async function () {
            await pharmaChain
                .connect(manufacturer)
                .initiateHandover(
                    batchId,
                    distributor.address
                );

            await pharmaChain
                .connect(distributor)
                .confirmHandover(batchId);

            const history =
                await pharmaChain.getTransferHistory(batchId);

            expect(history.length).to.equal(1);

            expect(history[0].from)
                .to.equal(manufacturer.address);

            expect(history[0].to)
                .to.equal(distributor.address);

            expect(history[0].timestamp).to.be.greaterThan(0n);

            expect(history[0].lifecycleAfterTransfer)
                .to.equal(3n);
        });

    });

    describe("Recall", function () {

        beforeEach(async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );
        });

        it("should allow admin to recall a batch", async function () {
            await pharmaChain
                .connect(admin)
                .recallBatch(batchId);

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.status).to.equal(1n);
        });

        it("should reject recall by unauthorized user", async function () {
            await expectRevert(
                pharmaChain
                    .connect(randomUser)
                    .recallBatch(batchId),
                "AccessControl"
            );
        });

        it("should prevent transfer of recalled batch", async function () {
            await pharmaChain
                .connect(admin)
                .recallBatch(batchId);

            await expectRevert(
                pharmaChain
                    .connect(manufacturer)
                    .initiateHandover(
                        batchId,
                        distributor.address
                    ),
                "Batch is not active"
            );
        });

    });

    describe("Suspension", function () {

        beforeEach(async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );
        });

        it("should suspend a batch", async function () {
            await pharmaChain
                .connect(admin)
                .suspendBatch(batchId);

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.status).to.equal(2n);
        });

        it("should prevent transfer of suspended batch", async function () {
            await pharmaChain
                .connect(admin)
                .suspendBatch(batchId);

            await expectRevert(
                pharmaChain
                    .connect(manufacturer)
                    .initiateHandover(
                        batchId,
                        distributor.address
                    ),
                "Batch is not active"
            );
        });

    });

    describe("Verification", function () {

        it("should verify a valid batch", async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );

            const result =
                await pharmaChain.verifyBatch(batchId);

            expect(result.exists)
                .to.equal(true);

            expect(result.valid)
                .to.equal(true);

            expect(result.expired)
                .to.equal(false);

            expect(result.currentOwner)
                .to.equal(manufacturer.address);
        });

        it("should report recalled batch as invalid", async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );

            await pharmaChain
                .connect(admin)
                .recallBatch(batchId);

            const result =
                await pharmaChain.verifyBatch(batchId);

            expect(result.exists)
                .to.equal(true);

            expect(result.valid)
                .to.equal(false);
        });

        it("should report unknown batch as invalid", async function () {
            const unknownBatch =
                ethers.keccak256(
                    ethers.toUtf8Bytes("UNKNOWN-BATCH")
                );

            const result =
                await pharmaChain.verifyBatch(
                    unknownBatch
                );

            expect(result.exists)
                .to.equal(false);

            expect(result.valid)
                .to.equal(false);
        });

    });

    describe("Lifecycle", function () {

        it("should update lifecycle by current owner", async function () {
            const expiry = await futureExpiry();

            await pharmaChain
                .connect(manufacturer)
                .registerBatch(
                    batchId,
                    medicineId,
                    1000,
                    expiry
                );

            await pharmaChain
                .connect(manufacturer)
                .updateLifecycle(
                    batchId,
                    5
                );

            const batch =
                await pharmaChain.getBatch(batchId);

            expect(batch.lifecycle)
                .to.equal(5n);
        });

    });

});