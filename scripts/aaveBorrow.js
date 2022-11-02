const { ethers, network, getNamedAccounts } = require("hardhat");
const { getWeth } = require("./getWeth.js");
const { networkConfig } = require("../helper-hardhat-config");

const chainId = network.config.chainId;
const amount = ethers.utils.parseEther("0.1");
// let totalDebt;

async function main() {
  const { deployer } = await getNamedAccounts();
  const wethTokenAddress = networkConfig[chainId]["wethToken"];
  //lending pool
  const lendingPoolAddress = await getLendingPool(deployer);
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    deployer
  );

  await getWeth();

  //approve lendingPool to spend(deposit) your(deployer) weth
  await approve(wethTokenAddress, deployer, lendingPoolAddress, amount);

  //deposit
  await deposit(lendingPool, deployer);

  //borrow dai
  //get the borrowing power in eth
  const { availableBorrowsETH } = await getUserData(lendingPool, deployer);

  //get dai price using chainlink price feed
  const daiPriceEth = await getDaiPrice();

  //convert that to dai
  const availableBorrowsDai =
    (availableBorrowsETH.toString() * 0.9 * 1) / daiPriceEth.toString();
  const daiToBorrowinWei = ethers.utils.parseEther(
    availableBorrowsDai.toString()
  );

  // then borrow the amount
  const daiTokenAddress = networkConfig[chainId]["daiToken"];
  await borrow(lendingPool, daiTokenAddress, daiToBorrowinWei, deployer);
  await getUserData(lendingPool, deployer);

  //repay
  //   const { totalDebtETH } = await getUserData(lendingPool, deployer);
  await repay(lendingPool, daiTokenAddress, daiToBorrowinWei, deployer);
  await getUserData(lendingPool, deployer);
}

//helpers

async function repay(lendingPool, assetAddress, amountToRepay, account) {
  await approve(assetAddress, account, lendingPool.address, amountToRepay);
  console.log("Repaying... ");
  await lendingPool.repay(assetAddress, amountToRepay, 1, account);
  console.log(`Repayed ${amountToRepay.toString()} of borrowed asset`);
}

async function borrow(lendingPool, assetAddress, amountToBorrow, account) {
  console.log("Borrowing....");
  await lendingPool.borrow(assetAddress, amountToBorrow, 1, 0, account);
  console.log("Borrowed....");
}

async function getUserData(lendingPool, account) {
  const { availableBorrowsETH, totalDebtETH } =
    await lendingPool.getUserAccountData(account);
  console.log(
    `Available borrowing power: ${availableBorrowsETH.toString() / 10e18}`
  );
  console.log(`Total debt: ${totalDebtETH.toString()}`);
  return { availableBorrowsETH, totalDebtETH };
}

async function getDaiPrice() {
  const aggregator = await ethers.getContractAt(
    "AggregatorV3Interface",
    networkConfig[chainId]["daiEthPriceFeed"]
  ); // no need to connect an account here as we're only reading from the contract, not sending any tx

  const price = (await aggregator.latestRoundData())[1];
  console.log(`Dai price in ETH: ${price.toString() / 10e18}`);
  return price;
}

/**
 deposit the weth to the lending pool
 * @param1 asset - will be the wethToken address
 * @param2 amount,
 * @parma3 on behalf of - deployer
 * @param4 referalcode
 */
async function deposit(lendingPool, account) {
  const tx = await lendingPool.deposit(
    networkConfig[chainId]["wethToken"],
    amount,
    account,
    0
  );
  await tx.wait(1);
  console.log("Deposited WETH to the lending pool");
}

// Function to approve the lendingPool to spend the ERC20 tokens in an account
async function approve(tokenAddress, account, spender, spendAmount) {
  const ERC20 = await ethers.getContractAt("IERC20", tokenAddress, account);
  await ERC20.approve(spender, spendAmount);
  console.log(`${spender} has been approved to spend WETH`);
}

// function to get the aave lending pool address
async function getLendingPool(account) {
  const chainId = network.config.chainId;
  const lendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    networkConfig[chainId]["lendingPoolAddressesProvider"],
    account
  );
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  console.log(`Lending pool address: ${lendingPoolAddress}`);
  return lendingPoolAddress;
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
