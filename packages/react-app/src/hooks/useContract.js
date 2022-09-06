import { useCallback,useMemo,useEffect, useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@self.id/3box-legacy';
import { addresses, abis } from "@project/contracts";
import { gql } from '@apollo/client';
import { ethers } from "ethers";


function useContract() {

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

  const gateways = [
    'https://w3s.link/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://nftstorage.link/ipfs/'
  ]

  const getMetadata = async(id,erc1155) => {
    const uriToken = await erc1155.uri(id);
    const metadataToken = JSON.parse(await (await fetch(uriToken.replace("ipfs://",gateways[Math.floor(Math.random()*gateways.length)]))).text());
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

  const checkNftOwned = useCallback((obj,coinbase) => {
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

  },[myNfts,myOwnedNfts]);

  const handleEvents = async(err,res) => {
    try{

      const id = res.returnValues._id;
      const coinbase =  res.coinbase;
      if(ids.includes(id)){
        return;
      }
      const creator = await hashavatars.creators(id);
      const metadata = await getMetadata(id,hashavatars)
      const owner = res.returnValues._to;

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
        await checkNftOwned(obj,coinbase);
      }
      return({
        obj: obj
      });
    } catch(err){
      throw(err)
    }
  }


  const handleEventsSubgraph = useCallback(async(res) => {
    try{
      const id = res.id;

      const returnValues = {
        _id: id
      }
      const metadata = await getMetadata(id,hashavatars);
      const creator = await hashavatars.creators(id);

      const obj = {
        returnValues: returnValues,
        metadata: metadata,
        creator: creator,
        owner: res.owner,
        tokenUri: res.uri
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
  },[hashavatars,nfts,getCreatorProfileCheck])

  const getTokenInfo = async token => {
    console.log(token)
    const returnValues = {
      _id: token.identifier
    }
    const metadata = await getMetadata(token.identifier,hashavatars);
    const obj = {
      returnValues: returnValues,
      metadata: metadata,
    }
    return(JSON.stringify(obj))
  }
  const getAllNFTs =   async (client,totalSupply,netId) => {



      //if(totalSupply && nfts?.length === 0  && !getData && hashavatars && client){
        //setGetData(true);
        setLoadingNFTs(true);
        if(Number(totalSupply) === 0){
          setLoadingNFTs(false);
          return
        }
        let id = totalSupply;
        let i = 0;
        let tokensQuery;
        let results;
        while(i < totalSupply){
          let promises = []
          tokensQuery = `
            query {
            erc1155Tokens(
              where:{contract:"${hashavatars.address.toLowerCase()}"},
              orderBy: identifier,
              orderDirection: desc
              skip: ${i}
            ) {
              id
              identifier
              uri
            }
          }
          `
          results = await client.query({
            query: gql(tokensQuery)
          });
          const tokens = results.data.erc1155Tokens;
          for(const token of tokens){
            if(netId === 4 && token.uri.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
              continue;
            }
            promises.push(
              handleEventsSubgraph({
                  id: token.identifier,
                  owner: null,
                  uri: token.uri,
              })
            );
          }
          await Promise.allSettled(promises);
          i = i + 100;
        }

  }


  const getMyNFTs =   async (client,coinbase,netId) => {

    //if(totalSupply && myNfts?.length === 0  && !getMyData && hashavatars && client && coinbase){
      //setGetMyData(true);
      setMyNfts([]);
      setMyOwnedNfts([]);
      setLoadingMyNFTs(true);
      let tokensQuery = `
        query {
          accounts(where: {id: "${coinbase.toLowerCase()}"}) {
            id
            ERC1155transferToEvent(
              where: {
                contract:  "${hashavatars.address.toLowerCase()}",
                from: ${null}
              }
            ){
              id
              token {
                id
                identifier
                uri
              }
              from {
                id
              }
              to {
                id
              }
            }
        		ERC1155balances(where: {contract: "${hashavatars.address.toLowerCase()}"}) {
        		  id
              token {
                id
                identifier
                uri
              }
        		}
          }
        }
      `
      const results = await client.query({
        query: gql(tokensQuery)
      });
      if(!results.data.accounts[0]){
        setLoadingMyNFTs(false)
        return;
      }
      const newMyOwnedNfts = results.data.accounts[0].ERC1155balances.map(e => e.token);
      const newMyCreatedNFts = results.data.accounts[0].ERC1155transferToEvent.map(e => e.token);
      setMyNfts(await Promise.all(newMyOwnedNfts.map(getTokenInfo)));
      setMyOwnedNfts(await Promise.all(newMyCreatedNFts.map(getTokenInfo)));
      setLoadingMyNFTs(false)
    //}


  }

  const initiateContracts = (netId,provider) => {
    //if(provider && netId && !hashavatars){
      ids = [];
      setSupply(null);
      setNfts([]);
      setMyNfts([]);
      setMyOwnedNfts([]);
      setCreators([]);
      setGetData(false);
      setCheckingEvents(false);
      setHashAvatars(null);
      setLoadingNFTs(true);
      let newToken;
      if(netId === 4){
        newToken = new ethers.Contract(addresses.erc1155.rinkeby,abis.erc1155,provider);
      }
      if(netId === 0x64){
        newToken = new ethers.Contract(addresses.erc1155.xdai,abis.erc1155,provider);
      }
      setHashAvatars(newToken)
    //}
  }


  useEffect(() => {
    if(hashavatars){
      getTotalSupply();
    }
  },[
    hashavatars,
    getTotalSupply
  ])

  const checkEvents = async (coinbase) => {
    //if(hashavatars){
      hashavatars.on("TransferSingle", async (operator,from,to,id,value) => {
        if(ids.includes(id)){
          return;
        }
        const res = {
          address: hashavatars.address,
          coinbase: coinbase,
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
    //}
  }


  return({
    hashavatars,
    creators,
    nfts,
    loadingNFTs,
    loadingMyNFTs,
    myNfts,
    myOwnedNfts,
    totalSupply,
    getMetadata,
    getTotalSupply,
    initiateContracts,
    getAllNFTs,
    getMyNFTs,
    checkEvents
  })
}

export default useContract;
