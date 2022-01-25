async function main() {
  // We get the contract to deploy
  const HashGovern = await ethers.getContractFactory("HashGovern");

  const govern = await HashGovern.deploy("0x5E7c0e4A817558e589817DA4E669f07CF4020f4F");

  console.log("Govern deployed to:", govern.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
