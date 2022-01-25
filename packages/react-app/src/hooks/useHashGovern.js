import { useMemo, useState,useEffect } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'

function useHashGovern() {

  const { state } = useAppContext();
  const [hashGovern,setGovern] = useState();
  const [erc20votes,setErc20Votes] = useState();
  const [hashBalance,setHashBalance] = useState();
  const [approved,setApproved] = useState();
  const [proposals,setProposals] = useState();
  const [wrapped,setWrapped] = useState();

  useMemo(() => {
    if(!hashGovern && state.provider && state.netId){
      if(state.netId === 4){
        setGovern(new ethers.Contract(addresses.hashGovern.rinkeby,abis.hashGovern,state.provider))
      } else {
        //setGovern(new ethers.Contract(addresses.hashGovern.xdai,abis.hashGovern,state.provider))
      }
    }
  },[hashGovern,state.provider,state.netId])



  useMemo(() => {
    if(!erc20votes && state.provider && state.netId){
      if(state.netId === 4){
        setErc20Votes(new ethers.Contract(addresses.hashVoteToken.rinkeby,abis.hashVoteToken,state.provider))
      } else {
        //setErc20Votes(new ethers.Contract(addresses.hashVoteToken.xdai,abis.hashVoteToken,state.provider))
      }
    }
  },[erc20votes,state.provider,state.netId])

  useMemo(async () => {
    if(erc20votes && state.coinbase && !wrapped){
      const newWrapped = [];
      for(let i = 1; i <= state.totalSupply; i++){
        const locker = await erc20votes.locker(state.hashavatars.address,i);
        if(locker.toLowerCase() === state.coinbase.toLowerCase()){
          newWrapped.push(i);
        }
      }
      setWrapped(newWrapped);
    }
  },[erc20votes,state.coinbase,wrapped,state.totalSupply])

  useMemo(() => {
    if(!proposals && state.provider && state.netId && hashGovern){
      const filter = hashGovern.filters.ProposalCreated()
      hashGovern.queryFilter(filter,0,"latest")
        .then((logs)=>{
          setProposals(logs);
      });
    }
  },[hashGovern,proposals,state.provider,state.netId]);


  useMemo(async () => {
    if(erc20votes && state.hashavatars && state.coinbase && state.netId === 4 && !hashBalance){
      const balance = await erc20votes.balanceOf(state.coinbase);
      setHashBalance(balance);
      const approval = await state.hashavatars.isApprovedForAll(state.coinbase,erc20votes.address);
      setApproved(approval);
      erc20votes.on('Transfer',async (from,to,amount,e) => {
        if(from.toLowerCase() === state.coinbase.toLowerCase() ||
          to.toLowerCase() === state.coinbase.toLowerCase()){
          const balance = await erc20votes.balanceOf(state.coinbase);
          setHashBalance(balance);
        }
      });
      state.hashavatars.on('ApprovalForAll',(owner,spender,value) => {
        if(owner.toLowerCase() === state.coinbase.toLowerCase() &&
           spender.toLowerCase() === erc20votes.address.toLowerCase()){
          setApproved(value)
        }
      })
    }
  },[erc20votes,state.coinbase,state.netId,state.hashavatars,hashBalance,approved]);



  return({hashGovern,erc20votes,proposals,hashBalance,approved,wrapped})
}

export default useHashGovern;
