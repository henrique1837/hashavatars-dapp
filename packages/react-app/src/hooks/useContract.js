import { useCallback,useMemo, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';
import { addresses, abis } from "@project/contracts";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';


import IPFS from 'ipfs-http-client-lite';

import useWeb3Modal from "./useWeb3Modal";


const APIURL_RINKEBY = "https://api.studio.thegraph.com/query/6693/hashavatars-rinkeby/0.0.5";
const APIURL_XDAI = "https://api.studio.thegraph.com/query/6693/hashavatars-xdai/0.0.1";


const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})

function useContract() {

  const {provider,coinbase,netId} = useWeb3Modal();
  const [hashavatars,setHashAvatars] = useState();
  const [getData,setGetData] = useState();
  const [client,setClient] = useState();
  const [mints,setMints] = useState();
  const [totalSupply,setSupply] = useState();
  const [creators,setCreators] = useState([]);
  const [nfts,setNfts] = useState([]);
  const [checkingEvents,setCheckingEvents] = useState(false);

  const [myNfts,setMyNfts] = useState([]);
  const [myOwnedNfts,setMyOwnedNfts] = useState([]);

  const [loadingNFTs,setLoadingNFTs] = useState();
  const [previousNetId,setPreviousNetId] = useState();
  const [previousCoinbase,setPreviousCoinbase] = useState();
  const [previousProvider,setPreviousProvider] = useState();

  let ids = [];

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
      if(res.address !== hashavatars.options.address){
        Promise.reject("Changed network")
      }
      const id = res.returnValues._id;
      if(ids.includes(id)){
        return;
      }
      const creator = await hashavatars.methods.creators(id).call();
      const metadata = await getMetadata(id,hashavatars)
      getLegacy3BoxProfileAsBasicProfile(creator).then(profile => {
        const creatorProfile = {
          address: creator,
          profile: profile
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){
          const newCreators = creators;
          newCreators.unshift(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      }).catch(err => {
        console.log(err);
        const creatorProfile = {
          address: creator,
          profile: undefined
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){

          const creatorProfile = {
            address: creator,
            profile: undefined
          }
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      });
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator
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
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[creators,hashavatars,coinbase,nfts,myNfts,myOwnedNfts,ids,getCreator,previousNetId,netId])

  const handleEventsSubgraph = useCallback(async(res) => {
    try{
      if(res.address !== hashavatars.options.address){
        Promise.reject("Changed network")
      }
      const id = res.id;
      const returnValues = {
        _id: id
      }
      if(ids.includes(id)){
        return;
      }
      //const metadata = JSON.parse(await ipfs.cat(res.metadata.replace("ipfs://","")))
      const metadata = JSON.parse(await (await fetch(`${res.metadata.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
      fetch(metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));

      const creator = res.creator;

      const obj = {
        returnValues: returnValues,
        metadata: metadata,
        creator: creator
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
        const owner = res.owner;
        if(owner.toLowerCase() === coinbase.toLowerCase() && !myOwnedNfts.includes(JSON.stringify(obj))){
          const newMyOwnedNfts = myOwnedNfts;
          newMyOwnedNfts.push(JSON.stringify(obj));
          setMyOwnedNfts([...newMyOwnedNfts.sort(function(xstr, ystr){
                          const x = JSON.parse(xstr)
                          const y = JSON.parse(ystr)
                          return y.returnValues._id - x.returnValues._id;
                        })]);
        }

      }


      if(id <= 1){
        setLoadingNFTs(false);
      }


      getLegacy3BoxProfileAsBasicProfile(creator).then(profile => {
        const creatorProfile = {
          address: creator,
          profile: profile
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      }).catch(err => {
        console.log(err);
        const creatorProfile = {
          address: creator,
          profile: undefined
        }
        if(!creators.includes(JSON.stringify(creatorProfile))){

          const creatorProfile = {
            address: creator,
            profile: undefined
          }
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      });




      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[hashavatars,coinbase,creators,nfts,myNfts,myOwnedNfts])

  useMemo(async () => {
    if(previousNetId !== netId || previousCoinbase !== coinbase || provider !== previousProvider || (!hashavatars && provider && !loadingNFTs)){
      setLoadingNFTs(true);
      if(previousNetId !== netId){
        setSupply(null);
        setMints(null);
        setNfts([]);
        setMyNfts([]);
        setMyOwnedNfts([]);
        setCreators([]);
        setGetData(false);
        setCheckingEvents(false);
      }
      setPreviousNetId(netId);
      setPreviousCoinbase(coinbase);
      setPreviousProvider(provider)

      setHashAvatars(null);
      ids = [];
      let newClient;
      if(netId === 4){
        setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.rinkeby));
        newClient = new ApolloClient({
          uri: APIURL_RINKEBY,
          cache: new InMemoryCache()
        });
      }
      if(netId === 0x64){
        setHashAvatars(new provider.eth.Contract(abis.erc1155,addresses.erc1155.xdai));
        newClient = new ApolloClient({
          uri: APIURL_XDAI,
          cache: new InMemoryCache()
        });
      }
      setClient(newClient);
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
      setLoadingNFTs(true);

      let promises = [];


      let id = totalSupply;
      let tokensQuery = `
        query {
              tokens(orderBy: tokenID,
                     orderDirection:desc,
                     where: {
                      tokenID_lte: ${id}
                    }) {
              id
              tokenID
              metadataURI
              creator {
                id
              }
              owner {
                id
              }
            }
        }
      `
      let totalQueries = id % 100;
      let actualQuery = 1;
      if(totalQueries > Number(id % 100).toFixed(0)){
        totalQueries = totalQueries + 1;
      }
      while(actualQuery <= totalQueries){
        const results = await client.query({
          query: gql(tokensQuery)
        });
        const tokens = results.data.tokens;
        for(const token of tokens){
          if(token.metadataURI.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
            continue;
          }
          await handleEventsSubgraph({
                  address: hashavatars.options.address,
                  id: token.tokenID,
                  owner: token.owner.id,
                  creator: token.creator.id,
                  metadata: token.metadataURI
          });
          if(id - 100 < 0 || id <= 1){
            setLoadingNFTs(false);
          }
        }
        id = id - 100;
        actualQuery = actualQuery + 1;
        if(id <= 0 || actualQuery > totalQueries){
          break;
        }
        tokensQuery = `
          query {
                tokens(orderBy: tokenID,
                       orderDirection:desc,
                       where: {
                        tokenID_lte: ${id}
                      }) {
                id
                tokenID
                metadataURI
                creator {
                  id
                }
                owner {
                  id
                }
              }
          }
        `
      }
      /*
      for(let i = totalSupply; i >= 0 ; i--){
        const res = {
          address: hashavatars.options.address,
          returnValues: {
            _id: i
          }
        };
        promises.push(handleEvents(null,res));
        if( i % 12 === 0 || i === 0){
          if(netId !== previousNetId){
            return;
          }
          await Promise.allSettled(promises);
          if(loadingNFTs && i === 0){
            setLoadingNFTs(false);
          }
          promises = [];
        }
      }
      */

    }
    if(!totalSupply && hashavatars){
      getTotalSupply();
    }

  },[
    provider,
    netId,
    hashavatars,
    mints,
    client,
    loadingNFTs,
    nfts,
    totalSupply,
    getTotalSupply,
    getData,
    checkingEvents,
    previousNetId
  ])

  return({hashavatars,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata,getTotalSupply})
}

export default useContract;
