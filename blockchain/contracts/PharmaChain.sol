// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PharmaChain is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant WAREHOUSE_ROLE = keccak256("WAREHOUSE_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    enum BatchStatus { ACTIVE, RECALLED, SUSPENDED }
    enum Lifecycle { CREATED, DISPATCHED, IN_TRANSIT, RECEIVED, AT_PHARMACY, SOLD }

    struct Batch {
        bytes32 batchId;
        bytes32 medicineId;
        address manufacturer;
        address currentOwner;
        uint256 quantity;
        uint256 expiryTimestamp;
        uint256 createdAt;
        BatchStatus status;
        Lifecycle lifecycle;
        bool exists;
    }

    struct PendingHandover {
        address from;
        address to;
        uint256 initiatedAt;
        bool exists;
    }

    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
        Lifecycle lifecycleAfterTransfer;
    }

    mapping(bytes32 => Batch) private batches;
    mapping(bytes32 => PendingHandover) private pendingHandovers;
    mapping(bytes32 => TransferRecord[]) private transferHistory;

    event BatchRegistered(bytes32 indexed batchId, bytes32 indexed medicineId, address indexed manufacturer, uint256 quantity, uint256 expiryTimestamp, uint256 timestamp);
    event HandoverInitiated(bytes32 indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event HandoverConfirmed(bytes32 indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event BatchRecalled(bytes32 indexed batchId, address indexed recalledBy, uint256 timestamp);
    event BatchSuspended(bytes32 indexed batchId, address indexed suspendedBy, uint256 timestamp);
    event BatchRestored(bytes32 indexed batchId, address indexed restoredBy, uint256 timestamp);
    event LifecycleUpdated(bytes32 indexed batchId, Lifecycle previousLifecycle, Lifecycle newLifecycle, address indexed updatedBy, uint256 timestamp);

    constructor(address admin) {
        require(admin != address(0), "Invalid admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function grantManufacturerRole(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(MANUFACTURER_ROLE, account);
    }

    function grantDistributorRole(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(DISTRIBUTOR_ROLE, account);
    }

    function grantWarehouseRole(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(WAREHOUSE_ROLE, account);
    }

    function grantPharmacyRole(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(PHARMACY_ROLE, account);
    }

    function registerBatch(
        bytes32 batchId,
        bytes32 medicineId,
        uint256 quantity,
        uint256 expiryTimestamp
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(batchId != bytes32(0), "Invalid batch ID");
        require(medicineId != bytes32(0), "Invalid medicine ID");
        require(!batches[batchId].exists, "Batch already exists");
        require(quantity > 0, "Quantity must be greater than zero");
        require(expiryTimestamp > block.timestamp, "Expiry must be in the future");

        batches[batchId] = Batch({
            batchId: batchId,
            medicineId: medicineId,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            quantity: quantity,
            expiryTimestamp: expiryTimestamp,
            createdAt: block.timestamp,
            status: BatchStatus.ACTIVE,
            lifecycle: Lifecycle.CREATED,
            exists: true
        });

        emit BatchRegistered(
            batchId,
            medicineId,
            msg.sender,
            quantity,
            expiryTimestamp,
            block.timestamp
        );
    }

    function initiateHandover(bytes32 batchId, address receiver) external {
        Batch storage batch = batches[batchId];

        require(batch.exists, "Batch does not exist");
        require(msg.sender == batch.currentOwner, "Not current owner");
        require(receiver != address(0), "Invalid receiver");
        require(receiver != msg.sender, "Cannot transfer to yourself");
        require(batch.status == BatchStatus.ACTIVE, "Batch is not active");
require(block.timestamp < batch.expiryTimestamp, "Batch has expired");
require(
    batch.lifecycle == Lifecycle.CREATED ||
    batch.lifecycle == Lifecycle.RECEIVED,
    "Invalid lifecycle for handover"
);
require(!pendingHandovers[batchId].exists, "Handover already pending");

        pendingHandovers[batchId] = PendingHandover({
            from: msg.sender,
            to: receiver,
            initiatedAt: block.timestamp,
            exists: true
        });

        batch.lifecycle = Lifecycle.DISPATCHED;

        emit HandoverInitiated(
            batchId,
            msg.sender,
            receiver,
            block.timestamp
        );
    }

    function confirmHandover(bytes32 batchId) external {
        Batch storage batch = batches[batchId];
        PendingHandover storage pending = pendingHandovers[batchId];

        require(batch.exists, "Batch does not exist");
        require(pending.exists, "No pending handover");
        require(msg.sender == pending.to, "Only receiver can confirm");
        require(batch.status == BatchStatus.ACTIVE, "Batch is not active");
        require(block.timestamp < batch.expiryTimestamp, "Batch has expired");

        address previousOwner = batch.currentOwner;

        batch.currentOwner = pending.to;
        batch.lifecycle = Lifecycle.RECEIVED;

        transferHistory[batchId].push(
            TransferRecord({
                from: previousOwner,
                to: pending.to,
                timestamp: block.timestamp,
                lifecycleAfterTransfer: Lifecycle.RECEIVED
            })
        );

        emit HandoverConfirmed(
            batchId,
            previousOwner,
            pending.to,
            block.timestamp
        );

        delete pendingHandovers[batchId];
    }

    function recallBatch(bytes32 batchId) external onlyRole(ADMIN_ROLE) {
        Batch storage batch = batches[batchId];

        require(batch.exists, "Batch does not exist");
        require(batch.status != BatchStatus.RECALLED, "Batch already recalled");

        batch.status = BatchStatus.RECALLED;

        emit BatchRecalled(batchId, msg.sender, block.timestamp);
    }

    function suspendBatch(bytes32 batchId) external onlyRole(ADMIN_ROLE) {
        Batch storage batch = batches[batchId];

        require(batch.exists, "Batch does not exist");
        require(batch.status == BatchStatus.ACTIVE, "Batch is not active");

        batch.status = BatchStatus.SUSPENDED;

        emit BatchSuspended(batchId, msg.sender, block.timestamp);
    }

    function restoreBatch(bytes32 batchId) external onlyRole(ADMIN_ROLE) {
        Batch storage batch = batches[batchId];

        require(batch.exists, "Batch does not exist");
        require(batch.status != BatchStatus.ACTIVE, "Batch already active");

        batch.status = BatchStatus.ACTIVE;

        emit BatchRestored(batchId, msg.sender, block.timestamp);
    }

    function updateLifecycle(bytes32 batchId, Lifecycle newLifecycle) external {
    Batch storage batch = batches[batchId];

    require(batch.exists, "Batch does not exist");
    require(
        msg.sender == batch.currentOwner ||
        hasRole(ADMIN_ROLE, msg.sender),
        "Not authorized"
    );

    if (!hasRole(ADMIN_ROLE, msg.sender)) {
        require(
            uint8(newLifecycle) == uint8(batch.lifecycle) + 1,
            "Invalid lifecycle transition"
        );
    }

    Lifecycle previousLifecycle = batch.lifecycle;
    batch.lifecycle = newLifecycle;

    emit LifecycleUpdated(
        batchId,
        previousLifecycle,
        newLifecycle,
        msg.sender,
        block.timestamp
    );
}
        

    function verifyBatch(bytes32 batchId)
        external
        view
        returns (
            bool exists,
            bool valid,
            bool expired,
            BatchStatus status,
            Lifecycle lifecycle,
            address currentOwner,
            uint256 expiryTimestamp
        )
    {
        Batch memory batch = batches[batchId];

        if (!batch.exists) {
            return (
                false,
                false,
                false,
                BatchStatus.ACTIVE,
                Lifecycle.CREATED,
                address(0),
                0
            );
        }

        bool expiredNow = block.timestamp >= batch.expiryTimestamp;
        bool validNow = batch.status == BatchStatus.ACTIVE && !expiredNow;

        return (
            true,
            validNow,
            expiredNow,
            batch.status,
            batch.lifecycle,
            batch.currentOwner,
            batch.expiryTimestamp
        );
    }

    function getBatch(bytes32 batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Batch does not exist");
        return batches[batchId];
    }

    function getPendingHandover(bytes32 batchId)
        external
        view
        returns (PendingHandover memory)
    {
        return pendingHandovers[batchId];
    }

    function getTransferHistory(bytes32 batchId)
        external
        view
        returns (TransferRecord[] memory)
    {
        return transferHistory[batchId];
    }

    function isExpired(bytes32 batchId) external view returns (bool) {
        require(batches[batchId].exists, "Batch does not exist");
        return block.timestamp >= batches[batchId].expiryTimestamp;
    }
}