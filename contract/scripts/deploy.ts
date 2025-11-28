import { ethers } from "hardhat";
import { SpaceInvadersGame } from "../src/SpaceInvadersGame.sol";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying SpaceInvadersGame with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const SpaceInvadersGameFactory = await ethers.getContractFactory("SpaceInvadersGame");
  const spaceInvadersGame = await SpaceInvadersGameFactory.deploy();

  await spaceInvadersGame.deployed();

  console.log("SpaceInvadersGame deployed to:", spaceInvadersGame.address);
  
  // Fund the contract with 10 CELO for rewards (10 CELO = 10 * 10^18 wei)
  const fundAmount = ethers.utils.parseEther("10");
  const fundTx = await deployer.sendTransaction({
    to: spaceInvadersGame.address,
    value: fundAmount
  });
  
  console.log("Funding transaction:", fundTx.hash);
  await fundTx.wait();
  
  console.log("Contract funded with 10 CELO for rewards");
  console.log("Contract balance:", ethers.utils.formatEther(await ethers.provider.getBalance(spaceInvadersGame.address)));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });