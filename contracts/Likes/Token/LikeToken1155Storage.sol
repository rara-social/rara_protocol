//SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

import "../../Config/IAddressManager.sol";

/// @title LikeToken1155StorageV1
/// @dev This contract will hold all local variables for the LikeToken1155 Contract
/// When upgrading the protocol, inherit from this contract on the V2 version and change the
/// LikeToken1155 to inherit from the later version.  This ensures there are no storage layout
/// corruptions when upgrading.
contract LikeToken1155StorageV1 {
    IAddressManager public addressManager;
    uint256 public idCount;
}

/// On the next version of the protocol, if new variables are added, put them in the below
/// contract and use this as the inheritance chain.
/**
contract LikeToken1155StorageV2 is LikeToken1155StorageV1 {
  address newVariable;
}
 */
