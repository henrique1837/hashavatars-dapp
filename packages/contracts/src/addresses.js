// This address points to a dummy ERC20 contract deployed on Ethereum Mainnet,
// Goerli, Kovan, Rinkeby and Ropsten. Replace it with your smart contracts.
const addresses = {
  ceaErc20: "0xc1C0472c0C80bCcDC7F5D01A376Bd97a734B8815",
  erc20: {
    cold: {
      rinkeby: "0x4f959be3d630200eb3ce29b8e3316badfd056cc7"
    },
    hash: {
      rinkeby: "0xef989c48a2b49185144c6f987d8f0194f050814b"
    }
  },
  erc1155: {
    rinkeby: "0xd1B57180FDB28d4169598702477b78407B26ce5F",
    xdai: "0x022E2426227E510123aABaFf4108Ddb6f59c2f8a",
    mainnet_bridged: "0xb74ca8bd02cc027a3f62f9a142cc195220c729cd"
  },
  hashHistories: {
    xdai: "0x4EDBD2c1dE6c29c0FC8c495d9dF76650ce310e24",
    rinkeby: "0xf23aD8E3ABe73042c024A187e6cba904439b24b5",
    rinkebyOld: "0x611592a48bff170d2a472dc736feafb315949aa0"
  },
  erc20Rewards:{
    rinkeby: "0xaB54FfE555ae9174C6397194A995f2fd58f42F99"
  },
  likes:{
    rinkeby: "0x6B2aeBCD6D5143deCA1030AD391A6af1F28aE949" ,
    xdai: "0x3086f887Ed3c682fe3282BDB0305Fa9aF8a363dc"
  }
};

export default addresses;
