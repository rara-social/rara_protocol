//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "../Permissions/IRoleManager.sol";
import "./IStandard1155.sol";
import "./Standard1155Storage.sol";

/// @title Standard1155
/// @dev This contract implements the 1155 standard
contract Standard1155 is
    IStandard1155,
    ERC1155Upgradeable,
    Standard1155StorageV1
{
    /// @dev verifies that the calling account has a role to enable minting tokens
    modifier onlyMinter() {
        IRoleManager roleManager = IRoleManager(
            addressManager.getRoleManager()
        );
        require(roleManager.isReactionMinter(msg.sender), "Not Minter");
        _;
    }

    /// @dev initializer to call after deployment, can only be called once
    function initialize(string memory _uri, address _addressManager)
        public
        initializer
    {
        __ERC1155_init(_uri);

        addressManager = IAddressManager(_addressManager);
    }

    /// @dev Allows a priviledged account to mint tokens to the specified address
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyMinter {
        _mint(to, id, amount, data);
    }
}
