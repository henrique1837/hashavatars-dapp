import { useCallback,useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'
import useERC20 from "./useERC20";

function useERC20Rewards() {

  const { state } = useAppContext();
  const { hash } = useERC20();

  const [rewards,setRewards] = useState();
  const [haveRewards,setHaveRewards] = useState();
  const [checked,setChecked] = useState(false);
  const [rewardsHashBalance,setRewardsHashBalance] = useState();

  const idsChecked = [];
  const [ids,setIds] = useState();
  const getRewards = useCallback(async () => {

    const newIds = [];
    const promises = [];

    for(let string of state.myNfts){
      const obj = JSON.parse(string);
      const id = obj.returnValues._id;
      if(!idsChecked.includes(id)){
        promises.push(
          new Promise(async (resolve,reject) => {
            try{
              const claimed = await rewards.claimed(state.coinbase,id);
              if(!claimed){
                newIds.push(id);
                idsChecked.push(ids)
              }
              resolve(claimed)
            } catch(err){
              reject(err)
            }
          })
        );

      }
    }
    await Promise.all(promises);
    const newBalanceHash = await hash.balanceOf(rewards.address);
    setRewardsHashBalance(newBalanceHash);
    setIds(newIds);
    if(newIds.length > 0 && Number(newBalanceHash) > 0){
      setHaveRewards(true)
    } else {
      setHaveRewards(false)
    }
    return(ids);

  },[rewards,state.coinbase,state.myNfts,hash]);


  const claimRewards = useCallback(async () => {
    if(ids.length > 0){
      try{
        const signer = state.provider.getSigner()

        const rewardsWithSigner = rewards.connect(signer);

        const tx = await rewardsWithSigner.claimMany(ids);
        await tx.wait();
        setIds([]);
      } catch(err){
        console.log(err)
      }
    }
  },[rewards,state.coinbase,ids])


  useMemo(async () => {
    if(!rewards && state.provider){
      setRewards(new ethers.Contract(addresses.erc20Rewards.rinkeby,abis.erc20Rewards,state.provider))
    }
    if(state.coinbase && rewards && state.myNfts && state.hashavatars && !state.loadingNFTs && hash){
      const ids = await getRewards();
      state.hashavatars.on("URI", async (value,id) => {
        await getRewards();

      });
      let filter = hash.filters.Transfer(null, rewards.address);
      hash.on(filter, async (from, to, amount, event) => {
          await getRewards()
      });
      filter = hash.filters.Transfer(rewards.address, null);
      hash.on(filter, async (from, to, amount, event) => {
          await getRewards()
      });

      setChecked(true);


    }
  },[rewards,state.coinbase,state.netId,state.provider,state.myNfts,state.hashavatars,state.loadingNFTs,hash])



  return({rewards,getRewards,haveRewards,claimRewards,rewardsHashBalance})
}

export default useERC20Rewards;
