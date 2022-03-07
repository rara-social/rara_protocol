import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { BigNumber } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { TEST_NFT_URI } from '../test/Scripts/constants';

export const TEST_REACTION_PRICE = BigNumber.from(10).pow(18); // Reactions cost 1 Token (token has 18 decimal places)
export const TEST_SALE_CURATOR_LIABILITY_BP = 5_000; // 50% goes to curator liability
export const TEST_SALE_CREATOR_BP = 200; // 2% goes to the creator
export const TEST_SALE_REFERRER_BP = 100; // 1% goes to the referrer

// getNamedAccounts,

// deploy
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, pauser, updater } = await getNamedAccounts();
  const { deploy } = deployments;
  console.log({ deployer });

  // Deploy the Role Manager first
  const RoleManagerFactory = await ethers.getContractFactory('RoleManager');
  const deployedRoleManager = await upgrades.deployProxy(RoleManagerFactory, [
    deployer
  ]);
  const roleManager = RoleManagerFactory.attach(deployedRoleManager.address);

  // Deploy Address Manager
  const AddressManagerFactory = await ethers.getContractFactory(
    'AddressManager'
  );
  const deployedAddressManager = await upgrades.deployProxy(
    AddressManagerFactory,
    [roleManager.address]
  );
  const addressManager = AddressManagerFactory.attach(
    deployedAddressManager.address
  );

  // Deploy Maker Registrar
  const MakerRegistrarFactory = await ethers.getContractFactory(
    'MakerRegistrar'
  );
  const deployedMakerRegistrar = await upgrades.deployProxy(
    MakerRegistrarFactory,
    [addressManager.address]
  );
  const makerRegistrar = MakerRegistrarFactory.attach(
    deployedMakerRegistrar.address
  );

  // Deploy Reaction Vault
  const ReactionVaultFactory = await ethers.getContractFactory('ReactionVault');
  const deployedReactionVault = await upgrades.deployProxy(
    ReactionVaultFactory,
    [addressManager.address]
  );
  const reactionVault = ReactionVaultFactory.attach(
    deployedReactionVault.address
  );

  // Deploy Testing NFT Token 1155
  // NOTE: We are not granting any default permissions for minting in the role manager to the owner
  // because the tests of the protocol should not assume any roles are granted for external accounts.
  const Test1155Factory = await ethers.getContractFactory('TestErc1155');
  const deployedTest1155 = await upgrades.deployProxy(Test1155Factory, [
    TEST_NFT_URI,
    addressManager.address
  ]);
  const testingStandard1155 = Test1155Factory.attach(deployedTest1155.address);

  // Deploy 1155 for NFT Reactions
  const ReactionNft1155Factory = await ethers.getContractFactory(
    'ReactionNft1155'
  );
  const deployedReactionNFT1155 = await upgrades.deployProxy(
    ReactionNft1155Factory,
    [TEST_NFT_URI, addressManager.address]
  );
  const reactionNFT1155 = ReactionNft1155Factory.attach(
    deployedReactionNFT1155.address
  );

  // Deploy the Parameter Manager
  const ParameterManagerFactory = await ethers.getContractFactory(
    'ParameterManager'
  );
  const deployedParameterManager = await upgrades.deployProxy(
    ParameterManagerFactory,
    [addressManager.address]
  );
  const parameterManager = ParameterManagerFactory.attach(
    deployedParameterManager.address
  );

  // Deploy an ERC20 Token for testing payments
  const TestErc20Factory = await ethers.getContractFactory('TestErc20');
  const deployedTestErc20 = await upgrades.deployProxy(TestErc20Factory, [
    'TEST',
    'TST'
  ]);
  const paymentTokenErc20 = TestErc20Factory.attach(deployedTestErc20.address);

  // Deploy the curator Shares Token Contract
  const CuratorShares1155Factory = await ethers.getContractFactory(
    'CuratorShares1155'
  );
  const deployedCuratorShares = await upgrades.deployProxy(
    CuratorShares1155Factory,
    [TEST_NFT_URI, addressManager.address]
  );
  const curatorShares = CuratorShares1155Factory.attach(
    deployedCuratorShares.address
  );

  // Deploy the Default Curator Vault
  const CuratorVaultFactory = await ethers.getContractFactory(
    'PermanentCuratorVault'
  );
  const deployedCuratorVault = await upgrades.deployProxy(CuratorVaultFactory, [
    addressManager.address,
    400000,
    curatorShares.address
  ]);
  const curatorVault = CuratorVaultFactory.attach(deployedCuratorVault.address);

  // Update address manager
  await addressManager.setRoleManager(roleManager.address);
  await addressManager.setParameterManager(parameterManager.address);
  await addressManager.setMakerRegistrar(makerRegistrar.address);
  await addressManager.setReactionNftContract(reactionNFT1155.address);
  await addressManager.setDefaultCuratorVault(curatorVault.address);

  // Update permissions in the Role Manager
  // Reaction Vault should be allowed to mint reactions
  const minterRole = await roleManager.REACTION_MINTER_ROLE();
  roleManager.grantRole(minterRole, reactionVault.address);

  // Update the Parameters in the protocol
  parameterManager.setPaymentToken(paymentTokenErc20.address);
  parameterManager.setReactionPrice(TEST_REACTION_PRICE);
  parameterManager.setSaleCuratorLiabilityBasisPoints(
    TEST_SALE_CURATOR_LIABILITY_BP
  );
  parameterManager.setSaleCreatorBasisPoints(TEST_SALE_CREATOR_BP);
  parameterManager.setSaleReferrerBasisPoints(TEST_SALE_REFERRER_BP);

  // return {
  //   addressManager,
  //   curatorShares,
  //   curatorVault,
  //   makerRegistrar,
  //   parameterManager,
  //   paymentTokenErc20,
  //   reactionNFT1155,
  //   reactionVault,
  //   roleManager,
  //   testingStandard1155
  // };
};

module.exports.tags = ['RA'];
export default func;
