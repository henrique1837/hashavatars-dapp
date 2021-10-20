import { useCallback,useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";
import { useAppContext } from '../hooks/useAppState'
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
              const claimed = await rewards.methods.claimed(state.coinbase,id).call();
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
    const newBalanceHash = await hash.methods.balanceOf(rewards.options.address).call();
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
        await rewards.methods.claimMany(ids).send({
          from: state.coinbase
        });
        setIds([]);
      } catch(err){
        console.log(err)
      }
    }
  },[rewards,state.coinbase,ids])


  useMemo(async () => {
    if(!rewards && state.provider){
      setRewards(new state.provider.eth.Contract(abis.erc20Rewards,addresses.erc20Rewards.rinkeby));

    }
    if(state.coinbase && rewards && state.myNfts && state.hashavatars && !state.loadingNFTs && hash){
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

      setChecked(true);


    }
  },[rewards,state.coinbase,state.netId,state.provider,state.myNfts,state.hashavatars,state.loadingNFTs,hash])



  return({rewards,getRewards,haveRewards,claimRewards,rewardsHashBalance})
}

export default useERC20Rewards;
