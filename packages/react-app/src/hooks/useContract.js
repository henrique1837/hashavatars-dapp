import { useCallback,useMemo, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';
import { addresses, abis } from "@project/contracts";

import useWeb3Modal from "./useWeb3Modal";

function useContract() {

  const {provider,coinbase,netId} = useWeb3Modal();
  const [hashavatars,setHashAvatars] = useState();
  const [getData,setGetData] = useState();

  const [mints,setMints] = useState();
  const [totalSupply,setSupply] = useState();
  const [creators,setCreators] = useState([]);
  const [nfts,setNfts] = useState([]);
  const [checkingEvents,setCheckingEvents] = useState(false);

  const [myNfts,setMyNfts] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState([]);

  const [loadingNFTs,setLoadingNFTs] = useState(true);
  const ids = [];

  const getMetadata = async(id,erc1155) => {
    const uriToken = await erc1155.methods.uri(id).call();
    if(uriToken.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
      throw("Err")
    }
    const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
    fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    return(metadataToken)
  }

  const getTotalSupply = useCallback(async () => {
    const totalSupply = await hashavatars.methods.totalSupply().call();
    setSupply(totalSupply);
    return(totalSupply)
  },[hashavatars])

  const getCreator = useCallback(async (id) => {
    const creator = await hashavatars.methods.creators(id).call();
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
      const newCreators = creators;
      newCreators.push(JSON.stringify(creatorProfile));
      setCreators([...newCreators]);
    }
    return(creatorProfile)
  },[hashavatars,creators])

  const handleEvents = useCallback(async(err,res) => {
    try{
      const id = res.returnValues._id;

      if(ids.includes(id)){
        return;
      }
      ids.push(id);
      const metadata = await getMetadata(id,hashavatars);
      const creatorProfile = await getCreator(id);
      const creator = creatorProfile.address;
      const profile = creatorProfile.profile
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator,
        profile: profile,
      }
      if(!nfts.includes(JSON.stringify(obj))){
        const newNfts = nfts;
        newNfts.push(JSON.stringify(obj));
        setNfts([...newNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                })]);
      }
      if(coinbase && creator){
        if(coinbase.toLowerCase() === creator.toLowerCase() && !myNfts.includes(JSON.stringify(obj))){
          const newMyNfts = myNfts;
          newMyNfts.push(JSON.stringify(obj));
          setMyNfts([...newMyNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                    })]);
        }
        const balance = await hashavatars.methods.balanceOf(coinbase,id).call();
        if(balance > 0 && !myOwnedNfts.includes(JSON.stringify(obj))){
          const newMyOwnedNfts = myOwnedNfts;
          newMyOwnedNfts.push(JSON.stringify(obj));
          setMyOwnedNfts([...newMyOwnedNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                        })]);
        }

      }


      return({
        obj: obj,
        creators: creators
      });
    } catch(err){
      throw(err)
    }
  },[creators,hashavatars,coinbase,nfts,myNfts,myOwnedNfts,ids,getCreator])


  useMemo(async () => {

    if(netId === 4 && !hashavatars){
      setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.rinkeby));
    }
    if(netId === 0x64 && !hashavatars){
      setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.xdai));
    }
    if(!mints && hashavatars && nfts.length === 0){
      hashavatars.getPastEvents("URI",{
        filter: {
        },
        fromBlock: 0
      },async (err,events) => {
        setMints(events);
      });
    }
    if(hashavatars && !checkingEvents){

      hashavatars.events.URI({
        filter: {
        },
        fromBlock: 'latest'
      },async (err,res) => {
        if(!err){
          setLoadingNFTs(true);
          await getTotalSupply();
          await handleEvents(err,res);
          setLoadingNFTs(false);

        }
      });
      setCheckingEvents(true);
    }

    if(totalSupply && nfts?.length === 0  && !getData){
      setGetData(true);
      let promises = [];
      for(let i = totalSupply; i >= 0 ; i--){
        const res = {
          returnValues: {
            _id: i
          }
        };
        promises.push(handleEvents(null,res));
        if( i % 12 === 0 || i === 0){
          await Promise.allSettled(promises);
          if(loadingNFTs && i === 0){
            setLoadingNFTs(false);
          }
          promises = [];
        }
      }


    }
    if(!totalSupply && hashavatars){
      getTotalSupply();
    }

  },[provider,netId,hashavatars,mints,handleEvents,loadingNFTs,nfts,totalSupply,getTotalSupply,getData,checkingEvents])

  return({hashavatars,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata,getTotalSupply})
}

export default useContract;
