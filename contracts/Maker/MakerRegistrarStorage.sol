//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../Config/IAddressManager.sol";
import "./IMakerRegistrar.sol";

/// @title MakerRegistrarStorage
/// @dev This contract will hold all local variables for the MakerRegistrar Contract
/// When upgrading the protocol, inherit from this contract on the V2 version and change the
/// MakerRegistrar to inherit from the later version.  This ensures there are no storage layout
/// corruptions when upgrading.
contract MakerRegistrarStorageV1 {
    /// @dev local reference to the address manager contract
    IAddressManager public addressManager;

    /// @dev prefix used in meta ID generation
    string public constant META_PREFIX = "MAKER";

    /// @dev An incrementing unique number assigned to each NFT that is registered.
    /// De-registering and re-registering should use the existing source ID
    uint256 public sourceCount;

    /// @dev Mapping to look up source ID from NFT address and ID
    mapping(address => mapping(uint256 => uint256)) public nftToSourceLookup;

    /// @dev Mapping to look up source ID from meta ID key
    mapping(uint256 => uint256) public metaToSourceLookup;

    /// @dev Mapping to look up nft details from source ID
    mapping(uint256 => IMakerRegistrar.NftDetails) public sourceToDetailsLookup;
}

/// On the next version of the protocol, if new variables are added, put them in the below
/// contract and use this as the inheritance chain.
/**
contract MakerRegistrarStorageV2 is MakerRegistrarStorageV1 {
  address newVariable;
}
 */