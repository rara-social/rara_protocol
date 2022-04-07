// load env
require("dotenv").config();
const ethers = require("ethers");
const deployConfig = require("../../../deploy_data/hardhat_contracts.json");
const {getWallet, chainId} = require("../helpers/utils");

const nftId = "46";
const nftContractAddress =
  deployConfig[chainId][0].contracts.TestErc721.address;

const creatorSaleBasisPoints = 2500;
const optionBits = 0;

async function main() {
  const creator = await getWallet("creator");
  const maker = await getWallet("maker");
  // const maker = await getWallet("maker");

  // registerNFT
  const MakerRegistrar = new ethers.Contract(
    deployConfig[chainId][0].contracts.MakerRegistrar.address,
    deployConfig[chainId][0].contracts.MakerRegistrar.abi,
    maker
  );
  const registerNftTxn = await MakerRegistrar.registerNft(
    nftContractAddress,
    nftId,
    "0xE27B562C20f689c0e80e6eAaA59D17ABB662129F",
    creatorSaleBasisPoints,
    optionBits
  );
  const receipt = await registerNftTxn.wait();
  console.log("done. transactionHash:", receipt.transactionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
