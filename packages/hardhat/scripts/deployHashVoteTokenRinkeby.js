async function main() {
  // We get the contract to deploy
  const HashVoteToken = await ethers.getContractFactory("HashVoteToken");

  const erc20 = await HashVoteToken.deploy(["0xd1B57180FDB28d4169598702477b78407B26ce5F","0xDdF5C160230C5cE0Ec1B46F9bC0a5DDf14829Cd2"]);

  console.log("ERC20 deployed to:", erc20.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
