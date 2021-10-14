import { useCallback,useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";
import useHashHistories from "./useHashHistories";

function useERC20() {

  const {provider,coinbase,netId} = useWeb3Modal();
  const { histories } = useHashHistories();
  const [cold,setCold] = useState();
  const [hash,setHash] = useState();
  const [coldBalance,setColdBalance] = useState();
  const [approvedCold,setApprovedCold] = useState();
  const [hashBalance,setHashBalance] = useState();

  const approveCold = async (spender) => {

    const supply = await cold.methods.totalSupply().call();

    await cold.methods.approve(spender,supply).send({
      from: coinbase
    });
  }

  useMemo(async () => {
    if(!cold && provider){
      setCold(new provider.eth.Contract(abis.erc20,addresses.erc20.cold.rinkeby));
    }
    if(!hash && provider){
      setHash(new provider.eth.Contract(abis.erc20,addresses.erc20.hash.rinkeby));
    }
    if(coinbase && !coldBalance && !hashBalance && cold && hash && histories ){
      const newBalanceCold = await cold.methods.balanceOf(coinbase).call();
      setColdBalance(newBalanceCold);
      const newBalanceHash = await hash.methods.balanceOf(coinbase).call();
      setHashBalance(newBalanceHash);
      const newApprovedCold = await cold.methods.allowance(coinbase,histories.options.address).call();
      setApprovedCold(newApprovedCold);
      cold.events.Approval({
        filter: {},
        fromBlock: 'latest'
      },(err,res) => {
        if(res.returnValues.owner.toLowerCase() === coinbase.toLowerCase() &&
           res.returnValues.spender.toLowerCase() === histories.options.address.toLowerCase()){
          setApprovedCold(Number(res.returnValues.value))
        }
      });
      cold.events.Transfer({
        filter: {},
        fromBlock: 'latest'
      },async (err,res) => {
        if(res.returnValues.from.toLowerCase() === coinbase.toLowerCase() ||
           res.returnValues.to.toLowerCase() === coinbase.toLowerCase()){
          const newBalanceCold = await cold.methods.balanceOf(coinbase).call();
          setColdBalance(newBalanceCold);
        }
      });
    }
  },[cold,provider,coldBalance,coinbase,histories,hash,hashBalance])



  return({cold,coldBalance,approvedCold,approveCold,hashBalance})
}

export default useERC20;
