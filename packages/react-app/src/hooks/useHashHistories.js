import { useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'

function useHashHistories() {

  const { state } = useAppContext();
  const [histories,setHistories] = useState();


  useMemo(() => {
    if(!histories && state.provider){
      setHistories(new ethers.Contract(addresses.hashHistories.rinkeby,abis.hashHistories,state.provider))
    }
  },[histories,state.provider])



  return({histories})
}

export default useHashHistories;
