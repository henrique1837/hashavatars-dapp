import { useCallback,useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";
import { useAppContext } from '../hooks/useAppState'
import useERC20 from "./useERC20";

function useERC20Rewards() {

  const {provider,coinbase,netId} = useWeb3Modal();
  const { state } = useAppContext();
  const { hash } = useERC20();

  const [rewards,setRewards] = useState();
  const [haveRewards,setHaveRewards] = useState();
  const [checked,setChecked] = useState(false);
  const [rewardsHashBalance,setRewardsHashBalance] = useState(false);

  const idsChecked = [];
  const [ids,setIds] = useState();
  const getRewards = useCallback(async () => {

    const newIds = [];
    for(let string of state.myNfts){
      const obj = JSON.parse(string);
      const id = obj.returnValues._id;
      if(!idsChecked.includes(id)){
        const claimed = await rewards.methods.claimed(coinbase,id).call();
        if(!claimed){
          newIds.push(id);
          idsChecked.push(ids)
        }
      }
    }
    const newBalanceHash = await hash.methods.balanceOf(rewards.options.address).call();
    setRewardsHashBalance(newBalanceHash);
    setIds(newIds);
    if(newIds.length > 0 && newBalanceHash > 0){
      setHaveRewards(true)
    } else {
      setHaveRewards(false)
    }
    return(ids);

  },[rewards,coinbase,state.myNfts,hash]);


  const claimRewards = useCallback(async () => {
    if(ids.length > 0){
      await rewards.methods.claimMany(ids).send({
        from: coinbase
      });
    }
  },[getRewards,rewards,coinbase,ids])


  useMemo(async () => {
    if(!rewards && provider){
      setRewards(new provider.eth.Contract(abis.erc20Rewards,addresses.erc20Rewards.rinkeby));
    }
    if(coinbase && rewards && state.myNfts && !checked && state.hashavatars && !state.loadingNFTs && hash){
      setChecked(true);
      const ids = await getRewards();
      state.hashavatars.events.URI({
        filter:{},
        fromBlock: 'latest'
      },async (err,res)=> {
        await getRewards();
      })
      hash.events.Transfer({
        filter:{
          to: rewards.options.address
        },
        fromBlock: 'latest'
      },async (err,res) => {
        await getRewards()
      });
      hash.events.Transfer({
        filter:{
          from: rewards.options.address
        },
        fromBlock: 'latest'
      },async (err,res) => {
        await getRewards()
      })

    }
  },[rewards,coinbase,netId,provider,state.myNfts,state.hashavatars,state.loadingNFTs,hash])



  return({rewards,getRewards,haveRewards,claimRewards,rewardsHashBalance})
}

export default useERC20Rewards;
