import { useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'

function useHashHistories() {

  const { state } = useAppContext();
  const [histories,setHistories] = useState();


  useMemo(() => {
    if(!histories && state.provider && state.netId){
      if(state.netId === 4){
        setHistories(new ethers.Contract(addresses.hashHistories.rinkeby,abis.hashHistories,state.provider))
      } else {
        setHistories(new ethers.Contract(addresses.hashHistories.xdai,abis.hashHistories,state.provider))
      }
    }
  },[histories,state.provider,state.netId])



  return({histories})
}

export default useHashHistories;
