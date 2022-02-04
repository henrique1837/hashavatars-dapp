import { useEffect, useState } from "react";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
import { ApolloClient, InMemoryCache } from '@apollo/client';

import  useWeb3Modal  from './useWeb3Modal';

const APIURL_RINKEBY = "https://api.studio.thegraph.com/query/6693/hashavatars-rinkeby/0.1.0";
const APIURL_XDAI = "https://api.thegraph.com/subgraphs/name/henrique1837/hash-avatars";


function useGraphClient() {
  const { netId } = useWeb3Modal();
  const [client,setClient] = useState();
  useEffect(() => {
    if(!client && netId){
     let newClient;
     if(netId === 4){
       newClient = new ApolloClient({
         uri: APIURL_RINKEBY,
         cache: new InMemoryCache()
       });
     }
     if(netId === 0x64){
       newClient = new ApolloClient({
         uri: APIURL_XDAI,
         cache: new InMemoryCache()
       });
     }
     setClient(newClient);
   }
 },[client,netId]);
  return({client})
}

export default useGraphClient;
