import { useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'
import useHashHistories from "./useHashHistories";

function useERC20() {

  const { state } = useAppContext();

  const { histories } = useHashHistories();
  const [cold,setCold] = useState();
  const [hash,setHash] = useState();
  const [coldBalance,setColdBalance] = useState();
  const [approvedCold,setApprovedCold] = useState();
  const [hashBalance,setHashBalance] = useState();

  const approveCold = async (spender) => {

    const supply = await cold.totalSupply();

    const signer = state.provider.getSigner();

    const coldWithSigner = cold.connect(signer);

    const tx = await coldWithSigner.approve(spender,supply);
    await tx.wait();

  }

  useMemo(async () => {
    if(!cold && state.provider && state.netId === 4){
      setCold(new ethers.Contract(addresses.erc20.cold.rinkeby,abis.erc20,state.provider))
    }
    if(!hash && state.provider && state.netId === 4){
      setHash(new ethers.Contract(addresses.erc20.hash.rinkeby,abis.erc20,state.provider))
    }
    if(state.coinbase && !coldBalance && !hashBalance && cold && hash && histories ){
      const newBalanceCold = await cold.balanceOf(state.coinbase);
      setColdBalance(newBalanceCold);
      const newBalanceHash = await hash.balanceOf(state.coinbase);
      setHashBalance(newBalanceHash);
      const newApprovedCold = await cold.allowance(state.coinbase,histories.address);
      setApprovedCold(newApprovedCold);
      cold.on('Approval',(owner,spender,value) => {
        if(owner.toLowerCase() === state.coinbase.toLowerCase() &&
           spender.toLowerCase() === histories.address.toLowerCase()){
          setApprovedCold(Number(value))
        }
      })
      cold.on('Transfer', async (from, to, amount, event) => {
        if(from.toLowerCase() === state.coinbase.toLowerCase() ||
           to.toLowerCase() === state.coinbase.toLowerCase()){
          const newBalanceCold = await cold.balanceOf(state.coinbase);
          setColdBalance(newBalanceCold);
        }
      });
    }
  },[cold,state.provider,coldBalance,state.coinbase,histories,hash,hashBalance,state.netId])



  return({cold,coldBalance,approvedCold,approveCold,hash,hashBalance})
}

export default useERC20;
