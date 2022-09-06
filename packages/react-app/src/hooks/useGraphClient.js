import { useEffect, useState } from "react";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
import { ApolloClient, InMemoryCache } from '@apollo/client';

const APIURL_RINKEBY = "https://api.studio.thegraph.com/query/6693/hashavatars-rinkeby/0.1.0";
const APIURL_XDAI = "https://api.thegraph.com/subgraphs/name/leon-do/xdai-erc721-erc1155";


function useGraphClient() {
  const [client,setClient] = useState();
  const initiateClient = (netId) => {
    //if(!client && netId){
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
   //}
 }

 return({client,initiateClient})
}

export default useGraphClient;
