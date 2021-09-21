import { useCallback,useContext,useEffect, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";

const getMetadata = async(id,erc1155) => {
  const uriToken = await erc1155.methods.uri(id).call();
  if(uriToken.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
    throw('Err')
  }
  const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
  fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
  return(metadataToken)
}


function useContract() {

  const [provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId] = useWeb3Modal();
  const [hashavatars,setHashAvatars] = useState();
  const [mints,setMints] = useState();
  const [creators,setCreators] = useState([]);
  const [nfts,setNfts] = useState([]);
  const [myNfts,setMyNfts] = useState([]);

  const [loadingNFTs,setLoadingNFTs] = useState(true);
  const ids = [];

  const handleEvents = async(err,res) => {
    try{
      if(ids.includes(res.returnValues._id)){
        return;
      }
      ids.push(res.returnValues._id);
      const metadata = await getMetadata(res.returnValues._id,hashavatars);
      const creator = await hashavatars.methods.creators(res.returnValues._id).call();
      //const creator = res.returnValues._to;
      let profile;
      let getProfile = true;
      creators.map(str => {
        const obj = JSON.parse(str);
        if(obj.address === creator){
          getProfile = false;
          profile = obj.profile
        }
      });
      if(getProfile){
        try{
          profile = await getLegacy3BoxProfileAsBasicProfile(creator);
        } catch(err){

        }

      }
      const creatorProfile = {
        address: creator,
        profile: profile
      }
      if(!creators.includes(JSON.stringify(creatorProfile))){
        creators.push(JSON.stringify(creatorProfile));
        setCreators(creators);
      }

      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator,
        profile: profile,
      }
      if(!nfts.includes(JSON.stringify(obj))){
        nfts.push(JSON.stringify(obj));
        setNfts(nfts.sort(function(xstr, ystr){
                        const x = JSON.parse(xstr)
                        const y = JSON.parse(ystr)
                        return y.returnValues._id - x.returnValues._id;
                }));
      }
      if(coinbase){
        if(coinbase.toLowerCase() === creator.toLowerCase() && !myNfts.includes(JSON.stringify(obj))){
          myNfts.push(JSON.stringify(obj));
          setMyNfts(myNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                  }));
        }
      }

      return({
        obj: obj,
        creators: creators
      });
    } catch(err){
      throw(err)
    }
  }


  useEffect(() => {

    if(netId === 4 && !hashavatars){
      setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.rinkeby));
    }
    if(netId === 0x64 && !hashavatars){
      setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.xdai));
    }
    if(!mints && hashavatars){
      hashavatars.getPastEvents("TransferSingle",{
        filter: {
          from: '0x0000000000000000000000000000000000000'
        },
        fromBlock: 0
      },async (err,events) => {
        setMints(events);
      });
    }

    if(mints && nfts?.length === 0){
      const promises = [];
      for(let i = mints.length-1; i > 0 ; i--){
        const res = mints[i];
        promises.push(handleEvents(null,res));
      }
      Promise.allSettled(promises).then(results => {
        if(loadingNFTs){
          setLoadingNFTs(false);
        }
      });

    }

  },[provider,netId,coinbase,hashavatars,mints,handleEvents,loadingNFTs,nfts])

  return([hashavatars,creators,nfts,loadingNFTs,myNfts,handleEvents])
}

export default useContract;
