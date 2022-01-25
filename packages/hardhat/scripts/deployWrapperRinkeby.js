async function main() {
  // We get the contract to deploy
  const ERC1155VoterWrapper = await ethers.getContractFactory("ERC1155VoterWrapper");

  const wrapper = await ERC1155VoterWrapper.deploy("0x4b3d2f97526b0546bc913b188c3333627155a9b2",["0xd1B57180FDB28d4169598702477b78407B26ce5F","0xDdF5C160230C5cE0Ec1B46F9bC0a5DDf14829Cd2"]);

  console.log("Wrapper deployed to:", wrapper.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
