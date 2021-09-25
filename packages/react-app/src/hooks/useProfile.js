import { useMemo, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';

import useWeb3Modal from './useWeb3Modal.js';

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register


function useProfile() {
  const {coinbase} = useWeb3Modal();
  const [profile,setProfile] = useState(null);
  useMemo(async () => {
    if (coinbase && !profile) {
      try{
        const newProfile = await getLegacy3BoxProfileAsBasicProfile(coinbase);
        setProfile(newProfile);
      } catch(err){
        console.log(err)
      }
    }
  }, [coinbase,profile]);
  return({profile})
}

export default useProfile;
