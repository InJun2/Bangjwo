// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentContract {
    address private owner;
    address private proposedOwner;

    struct Contract {
        string ipfsHash;  // 계약서 CID (IPFS)
        uint64 landlord;  // 임대인 ID (DB 관리)
        uint64 tenant;    // 임차인 ID (DB 관리)
    }

    mapping(uint256 => Contract) private contracts;

    event ContractCreated(uint256 indexed contractId, string ipfsHash, uint64 landlord, uint64 tenant);
    event OwnershipProposed(address indexed currentOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyProposedOwner() {
        require(msg.sender == proposedOwner, "Not proposed owner");
        _;
    }

    constructor(address _owner, address _proposedOwner) {
        require(_owner != address(0), "Invalid owner address");
        require(_proposedOwner != address(0), "Invalid proposed owner address");
        owner = _owner;
        proposedOwner = _proposedOwner;

        emit OwnershipProposed(_owner, _proposedOwner);
    }

    function proposeOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner is zero address");
        require(_newOwner != owner, "New owner is current owner");
        require(_newOwner == proposedOwner, "New owner is already proposed");
        
        proposedOwner = _newOwner;
        emit OwnershipProposed(owner, _newOwner);
    }

    function acceptOwnership() external onlyProposedOwner {
        emit OwnershipTransferred(owner, proposedOwner);
        owner = proposedOwner;
        proposedOwner = address(0);
    }

    function registerContract(
        uint256 _id,
        string calldata _ipfsHash,
        uint64 _landlord,
        uint64 _tenant
    ) external onlyOwner {
        require(contracts[_id].landlord == 0, "Contract ID exists");
        require(isCID(_ipfsHash), "Invalid IPFS CID");

        contracts[_id] = Contract(_ipfsHash, _landlord, _tenant);
        emit ContractCreated(_id, _ipfsHash, _landlord, _tenant);
    }

    function getContract(uint256 _contractId, uint64 _requesterId) external view returns (string memory) {
        Contract memory c = contracts[_contractId];
        require(c.landlord != 0, "Contract not found");
        require(_requesterId == c.landlord || _requesterId == c.tenant, "Unauthorized");

        return c.ipfsHash;
    }

    function isCID(string calldata _cid) internal pure returns (bool) {
        bytes memory cidBytes = bytes(_cid);
        uint256 length = cidBytes.length;

        if (length == 46) {
            // CIDv0 검증 (Base58, 항상 "Qm"으로 시작)
            return (cidBytes[0] == 'Q' && cidBytes[1] == 'm');
        } else if (length >= 49 && length <= 59) {
            // CIDv1 검증 (Base32, 항상 "bafy"로 시작)
            return (
                cidBytes[0] == 'b' &&
                cidBytes[1] == 'a' &&
                cidBytes[2] == 'f' &&
                cidBytes[3] == 'y'
            );
        }
        return false;
    }

}
