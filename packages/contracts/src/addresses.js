// This address points to a dummy ERC20 contract deployed on Ethereum Mainnet,
// Goerli, Kovan, Rinkeby and Ropsten. Replace it with your smart contracts.
const addresses = {
  ceaErc20: "0xc1C0472c0C80bCcDC7F5D01A376Bd97a734B8815",
  erc20: {
    cold: {
      rinkeby: "0x4f959be3d630200eb3ce29b8e3316badfd056cc7"
    },
    hash: {
      rinkeby: "0x84531e649574713bde08beafae2f429cd4372c10"
    }
  },
  erc1155: {
    rinkeby: "0xd1B57180FDB28d4169598702477b78407B26ce5F",
    xdai: "0x022E2426227E510123aABaFf4108Ddb6f59c2f8a",
    mainnet_bridged: "0xb74ca8bd02cc027a3f62f9a142cc195220c729cd"
  },
  hashHistories: {
    rinkeby: "0x611592a48bff170d2a472dc736feafb315949aa0",
  },
  erc20Rewards:{
    rinkeby: "0xEeE66864AfFDfeB99D3880d3440a730E7049D87E"
  }
};

export default addresses;
