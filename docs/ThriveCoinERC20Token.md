# ThriveCoinRewardReceipt - ThriveCoin reward receipt database (ThriveCoinRewardReceipt.sol)

**View Source:** [contracts/ThriveCoinRewardReceipt.sol](../contracts/ThriveCoinRewardReceipt.sol)

**Extends ↗:** [AccessControlEnumerable (openzeppelin@4.6.0)](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.6.0/contracts/access/AccessControlEnumerable.sol)


**Author:** vigan.abd

**Description**: ThriveCoinRewardReceipt is a simple smart contract that is used to store
reward receipts that are done through thrivecoin platform. Receipts can be
stored only by `WRITER_ROLE` and the contract supports role management
functionality. Additionally all stored receipts can be enumerated by
combining `count` and `getReceipt` functionality.

## Contract Structures
- [RewardReceipt{address recipient; string transferTx; string version; uint256 timestamp; string metaDataURI;}](#RewardReceipt)

### RewardReceipt
Structure that holds relevant information related to reward receipt

**Properties**
- `recipient<address>` - Reward recipient
- `transferTx<string>` - Optional reward transaction hash
- `version<string>` - App version used to distribute the reward
- `timestamp<uint256>` - Reward timestamp in UNIX EPOCH seconds
- `metaDataURI<string>` - Optional URI that points to reward metadata 

## Contract Events
- [RewardReceiptStored(uint256 indexed id, address recipient, string transferTx, string version, uint256 timestamp, string metaDataURI)](#RewardReceiptStored)

### RewardReceiptStored
Emitted when a new reward receipt is stored, it includes all params
stored in `RewardReceipt` structure and additionally generated `id` that is
also indexed.
```solidity
event RewardReceiptStored(uint256 indexed id, address recipient, string transferTx, string version, uint256 timestamp, string metaDataURI)
```

**Arguments**
- `id<uint256>`
- `recipient<address>`
- `transferTx<string>`
- `version<string>`
- `timestamp<uint256>`
- `metaDataURI<string>`

## Contract Constants
- `WRITER_ROLE<bytes32>` - Writer role hash identifier (keccak256("WRITER_ROLE"))

## Contract Members
- `_idTracker<Counters.Counter>` - Private id auto increment property
- `_rewardReceipts<mapping(uint256 => RewardReceipt)>` - Reward receipt entries stored in format `id` => `receipt` 

## Contract Methods
- [constructor()](#constructor)
- [count()](#count)
- [addReceipt(address recipient, string memory transferTx, string memory version, uint256 timestamp, string memory metaDataURI)](#addReceipt)
- [getReceipt(uint256 id)](#getReceipt)

### constructor
Grants `DEFAULT_ADMIN_ROLE` and `WRITER_ROLE` to the account that
deploys the contract.
```solidity
constructor()
```

**Arguments**
- None

**Returns**
- `void` 

### count
Returns the total number of receipts stored.
```solidity
function count() public view returns (uint256)
```

**Arguments**
- None

**Returns**
- `uint256` 

### addReceipt
Stores a new reward receipt and emits `RewardReceiptStored` event that
includes indexed receipt id.

Requirements:
- the caller must have the `WRITER_ROLE`.

```solidity
function addReceipt(address recipient, string memory transferTx, string memory version, uint256 timestamp, string memory metaDataURI) public virtual
```

**Arguments**
- `recipient<address>` - Reward recipient
- `transferTx<string>` - Optional reward transaction hash
- `version<string>` - App version used to distribute the reward
- `timestamp<uint256>` - Reward timestamp in UNIX EPOCH seconds
- `metaDataURI<string>` - Optional URI that points to reward metadata

**Returns**
- `void` 

### getReceipt
Returns the receipt details.

Requirements:
- The id should be greater than 0 and also less than or equal to total
  receipt count.

```solidity
function getReceipt(uint256 id) public view returns (RewardReceipt memory receipt)
```

**Arguments**
- `id<uint256>` - Receipt identifier

**Returns**
- `RewardReceipt` - See [RewardReceipt](#RewardReceipt) 
