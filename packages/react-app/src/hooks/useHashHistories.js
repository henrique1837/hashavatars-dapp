import { useCallback,useMemo, useState } from "react";
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";
import useContract from "./useContract";

function useHashHistories() {

  const {provider} = useWeb3Modal();
  const [histories,setHistories] = useState();


  useMemo(() => {
    if(!histories && provider){
      setHistories(new provider.eth.Contract(abis.hashHistories,addresses.hashHistories.rinkeby));
    }
  },[histories,provider])



  return({histories})
}

export default useHashHistories;
