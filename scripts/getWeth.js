const { getNamedAccounts, ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const amount = ethers.utils.parseEther("0.2");

async function getWeth() {
  const chainId = network.config.chainId;
  const { deployer } = await getNamedAccounts();
  const wethTokenAddress = networkConfig[chainId]["wethToken"];

  //initialize the contract with the interface, contract address, account
  const weth = await ethers.getContractAt("IWeth", wethTokenAddress, deployer);

  //deposit eth to to the contract
  console.log(`Depositing ETH to the contract...`);
  const tx = await weth.deposit({ value: amount });
  const txResponse = await tx.wait(1);
  console.log(`Deposited ETH...`);

  //get the weth balance of deployer
  const wethBalance = await weth.balanceOf(deployer);
  console.log(`weth balaance: ${wethBalance.toString() / 10e18}`);
}

module.exports = { getWeth };
