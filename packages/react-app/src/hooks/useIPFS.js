import { useMemo, useState } from "react";
import * as IPFS from 'ipfs';

function useIpfs() {

  const [ipfs,setIpfs] = useState();
  const [ipfsErr,setIpfsErr] = useState();

  useMemo( () => {

    if(!ipfs){

              IPFS.create()
              .then(async newIpfs => {
                setIpfs(newIpfs)
                console.log("IPFS started");
            })
            .catch(err => {
              console.log(err)
              setIpfsErr(true)
            });
    }

  },[ipfs])



  return({ipfs,ipfsErr})
}

export default useIpfs;
