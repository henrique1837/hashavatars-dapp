import { useCallback,useMemo,useEffect, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@self.id/3box-legacy';
import { addresses, abis } from "@project/contracts";
import { gql } from '@apollo/client';
import { ethers } from "ethers";

import useWeb3Modal from "./useWeb3Modal";
import useGraphClient from "./useGraphClient";




function useContract() {

  const {provider,coinbase,netId} = useWeb3Modal();
  const {client} = useGraphClient();
  const [hashavatars,setHashAvatars] = useState();
  const [getData,setGetData] = useState();
  const [getMyData,setGetMyData] = useState();

  const [totalSupply,setSupply] = useState();
  const [creators,setCreators] = useState();
  const [nfts,setNfts] = useState();
  const [checkingEvents,setCheckingEvents] = useState(false);

  const [myNfts,setMyNfts] = useState();
  const [myOwnedNfts,setMyOwnedNfts] = useState();

  const [loadingNFTs,setLoadingNFTs] = useState();
  const [loadingMyNFTs,setLoadingMyNFTs] = useState();

  let ids = [];


  const getMetadata = async(id,erc1155) => {
    const uriToken = await erc1155.uri(id);
    const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
    fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    //const image = await (await fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"))).text()
    //metadataToken.svg = image;

    return(metadataToken)
  }

  const getTotalSupply = useCallback(async () => {
    const totalSupply = Number(await hashavatars.totalSupply());
    setSupply(totalSupply);
    return(totalSupply)
  },[hashavatars])


  const getCreatorProfileCheck = useCallback(creator => {
    let getCreatorProfile = true;
    creators.map(str => {
      const creatorProfile = JSON.parse(str);
      if(creator.toLowerCase() === creatorProfile.address.toLowerCase()){
        getCreatorProfile = false;
      }
    });
    if(getCreatorProfile){
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
          const newCreators = creators;
          newCreators.push(JSON.stringify(creatorProfile));
          setCreators([...newCreators]);
        }
      });
    }
  },[creators]);

  const checkNftOwned = useCallback((obj) => {
    if(coinbase.toLowerCase() === obj.creator.toLowerCase() && !myNfts.includes(JSON.stringify(obj))){
      const newMyNfts = myNfts;
      newMyNfts.push(JSON.stringify(obj));
      setMyNfts([...newMyNfts.sort(function(xstr, ystr){
                      const x = JSON.parse(xstr)
                      const y = JSON.parse(ystr)
                      return y.returnValues._id - x.returnValues._id;
                })]);
    }
    const owner = obj.owner;
    if(owner.toLowerCase() === coinbase.toLowerCase() && !myOwnedNfts.includes(JSON.stringify(obj))){
      const newMyOwnedNfts = myOwnedNfts;
      newMyOwnedNfts.push(JSON.stringify(obj));
      setMyOwnedNfts([...newMyOwnedNfts.sort(function(xstr, ystr){
                      const x = JSON.parse(xstr)
                      const y = JSON.parse(ystr)
                      return y.returnValues._id - x.returnValues._id;
                    })]);
    }

  },[coinbase,myNfts,myOwnedNfts]);
  const handleEvents = useCallback(async(err,res) => {
    try{

      const id = res.returnValues._id;
      if(ids.includes(id)){
        return;
      }
      const creator = await hashavatars.creators(id);
      const metadata = await getMetadata(id,hashavatars)
      const owner = res.returnValues._to;

      if(creator.toLowerCase() === coinbase.toLowerCase() && myNfts.length === 0){
        return;
      }
      if(owner.toLowerCase() === coinbase.toLowerCase() && myOwnedNfts.length === 0){
        return;
      }
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator,
        owner: owner
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
      getCreatorProfileCheck(creator);
      if(coinbase){
        await checkNftOwned(obj);
      }
      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[hashavatars,coinbase,nfts,ids,checkNftOwned,getCreatorProfileCheck])

  const handleEventsSubgraph = useCallback(async(res) => {
    try{
      const id = res.id;
      const returnValues = {
        _id: id
      }
      if(ids.includes(id)){
        return;
      }
      let metadata;
      if(!res.imageURI){
        metadata = JSON.parse(await (await fetch(`${res.metadata.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
      } else {
        metadata = {
          name: res.name,
          image: res.imageURI,
        }
      }

      const creator = res.creator;

      const obj = {
        returnValues: returnValues,
        metadata: metadata,
        creator: creator,
        owner: res.owner,
        tokenUri: res.metadata
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
      getCreatorProfileCheck(creator);
      if(id <= 1){
        setLoadingNFTs(false);
      }

      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  },[hashavatars,nfts,checkNftOwned,getCreatorProfileCheck])

  const getTokenInfo = async token => {

    const returnValues = {
      _id: token.tokenID
    }
    let metadata
    if(!token.imageURI){
      metadata = JSON.parse(await (await fetch(`${token.metadataURI.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
    } else {
      metadata = {
        name: token.name,
        image: token.imageURI,
      }
    }
    const obj = {
      returnValues: returnValues,
      metadata: metadata,
    }
    return(JSON.stringify(obj))
  }
  useMemo(() => {
    if(provider && netId && !hashavatars){
      ids = [];
      let newToken;
      if(netId === 4){
        newToken = new ethers.Contract(addresses.erc1155.rinkeby,abis.erc1155,provider);
      }
      if(netId === 0x64){
        newToken = new ethers.Contract(addresses.erc1155.xdai,abis.erc1155,provider);
      }
      setHashAvatars(newToken)
    }
  },[
    hashavatars,
    provider,
    netId
  ])
  useEffect(() => {
      setSupply(null);
      setNfts([]);
      setMyNfts([]);
      setMyOwnedNfts([]);
      setCreators([]);
      setGetData(false);
      setCheckingEvents(false);
      setHashAvatars(null);
      setLoadingNFTs(true);
  },[
    netId
  ])
  useEffect(() => {

    setMyNfts([]);
    setMyOwnedNfts([]);
    setGetMyData(false);
    setLoadingMyNFTs(true);

  },[
    coinbase
  ])

  useEffect(() => {
    if(hashavatars){
      getTotalSupply();
    }
  },[
    hashavatars,
    getTotalSupply
  ])
  useMemo(async () => {
    if(hashavatars && !checkingEvents && !loadingNFTs && !loadingMyNFTs){
      hashavatars.on("TransferSingle", async (operator,from,to,id,value) => {
        if(ids.includes(id)){
          return;
        }
        const res = {
          address: hashavatars.address,
          returnValues: {
            _id: Number(id),
            _to: to,
          }
        }
        setLoadingNFTs(true);
        await getTotalSupply();
        await handleEvents(null,res);
        setLoadingNFTs(false);

      });
      setCheckingEvents(true);
    }
  },[
    hashavatars,
    checkingEvents,
    loadingNFTs,
    loadingMyNFTs,
    getTotalSupply,
    handleEvents,
    ids
  ])

  useMemo(async () => {



    if(totalSupply && nfts?.length === 0  && !getData && hashavatars && client){
      setGetData(true);
      setLoadingNFTs(true);
      if(Number(totalSupply) === 0){
        setLoadingNFTs(false);
        return
      }
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
              ${netId !== 4 ? "name" : ""}
              tokenID
              metadataURI
              ${netId !== 4 ? "imageURI" : ""}
              creator {
                id
              }
              owner {
                id
              }
            }
        }
      `
      let totalQueries = id/100;
      let actualQuery = 1;
      if(totalQueries > Number(id/100).toFixed(0)){
        totalQueries = totalQueries + 1;
      }
      if(totalQueries < actualQuery){
        totalQueries = actualQuery
      }
      while(actualQuery <= totalQueries){
        const results = await client.query({
          query: gql(tokensQuery)
        });

        const tokens = results.data.tokens;
        for(const token of tokens){
          if(netId === 4 && token.metadataURI.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
            continue;
          }
          promises.push(
            handleEventsSubgraph({
                    address: token.address,
                    id: token.tokenID,
                    owner: token.owner.id,
                    creator: token.creator.id,
                    metadata: token.metadataURI,
                    name: token.name,
                    imageURI: token.imageURI
            })
          );
          if(token.tokenID % 12 === 0 || token.tokenID === 1){
            await Promise.allSettled(promises);
            promises = [];
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
                ${netId !== 4 ? "name" : ""}
                metadataURI
                ${netId !== 4 ? "imageURI" : ""}
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

    }


  },[
    hashavatars,
    nfts,
    netId,
    totalSupply,
    getData,
    client,
    handleEventsSubgraph
  ])


  useMemo(async () => {



    if(totalSupply && myNfts?.length === 0  && !getMyData && hashavatars && client && coinbase){
      setGetMyData(true);
      setLoadingMyNFTs(true);
      let tokensQuery = `
        query {
              users(where: {
                id: "${coinbase.toLowerCase()}"
              }) {
                id
                tokens(orderBy: tokenID,
                       orderDirection: desc) {
                  id
                  ${netId !== 4 ? "name" : ""}
                  tokenID,
                  metadataURI,
                  ${netId !== 4 ? "imageURI" : ""}
                  createdAtTimestamp
                }
                created(orderBy: tokenID,
                        orderDirection: desc) {
                  id
                  ${netId !== 4 ? "name" : ""}
                  tokenID,
                  metadataURI,
                  ${netId !== 4 ? "imageURI" : ""}
                  createdAtTimestamp
                }
              }
            }
      `
      const results = await client.query({
        query: gql(tokensQuery)
      });
      if(!results.data.users[0]){
        setLoadingMyNFTs(false)
        return;
      }
      const newMyOwnedNfts = results.data.users[0].tokens.map(getTokenInfo);
      const newMyCreatedNFts = results.data.users[0].created.map(getTokenInfo);
      setMyNfts(await Promise.all(newMyCreatedNFts));
      setMyOwnedNfts(await Promise.all(newMyOwnedNfts));
      setLoadingMyNFTs(false)
    }


  },[
    hashavatars,
    myNfts,
    totalSupply,
    getMyData,
    client,
    coinbase,
    netId,
  ])

  return({hashavatars,creators,nfts,loadingNFTs,loadingMyNFTs,myNfts,myOwnedNfts,totalSupply,getMetadata,getTotalSupply})
}

export default useContract;
