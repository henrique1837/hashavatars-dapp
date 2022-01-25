import erc20Abi from "./abis/erc20.json";
import ownableAbi from "./abis/ownable.json";
import erc1155Abi from "./abis/erc1155.json";
import hashHistoriesAbi from "./abis/hashHistories.json";
import erc20RewardsAbi from "./abis/erc20Rewards.json";
import likesAbi from "./abis/likes.json";
import hashGovernAbi from "./abis/hashGovern.json";
import hashVoteTokenAbi from "./abis/hashVoteToken.json";

const abis = {
  erc20: erc20Abi,
  ownable: ownableAbi,
  erc1155: erc1155Abi,
  hashHistories: hashHistoriesAbi,
  erc20Rewards: erc20RewardsAbi,
  likes: likesAbi,
  hashVoteToken: hashVoteTokenAbi,
  hashGovern: hashGovernAbi
};

export default abis;
