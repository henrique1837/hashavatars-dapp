import React,{useEffect,useMemo,useState} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { Main,Box,Link,IconLink } from '@aragon/ui';

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import useIPFS from "./hooks/useIPFS";

import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
import Mint from "./screens/Mint";
import Profile from "./screens/Profile";
import UserProfile from "./screens/UserProfile";

import Histories from "./screens/HashHistories";
import Activities from "./screens/Activities";
import Governance from "./screens/Governance";

import GamesPage from "./screens/Games";


import AllAvatars from "./screens/AllAvatars";

import Menu from "./components/Menu";
import CallbackUNSLogin from "./callback/callbackUNSLogin";


//import GET_TRANSFERS from "./graphql/subgraph";


function App() {

  const {provider,coinbase,netId,profile,connecting,loadWeb3Modal} = useWeb3Modal();
  const {hashavatars,creators,nfts,loadingNFTs,loadingMyNFTs,myNfts,myOwnedNfts,totalSupply,getTotalSupply,getMetadata} = useContract();
  const {ipfs} = useIPFS();
  const { state, actions } = useAppState();
  const [pinning,setPinning] = useState();

  useEffect(() => {
    actions.setConnecting(connecting);
  },[connecting])
  useEffect(() => {
    actions.setProvider(provider);
    actions.setLoadWeb3Modal(loadWeb3Modal);
  },[provider])

  useEffect(() => {
    actions.setCoinbase(coinbase);
  },[coinbase])
  useEffect(() => {
    actions.setNetId(netId);
  },[netId])
  useEffect(() => {
    actions.setProfile(profile);
  },[profile])

  useEffect(() => {
    actions.setHashAvatars(hashavatars);
    actions.setGetTotalSupply(getTotalSupply);
    actions.setGetMetadata(getMetadata);

  },[hashavatars])


  useEffect(() => {
    actions.setNfts(nfts)
  },[nfts])

  useEffect(() => {
    actions.setMyOwnedNfts(myOwnedNfts)
  },[myOwnedNfts])
  useEffect(() => {
    actions.setMyNfts(myNfts)
  },[myNfts])

  useEffect(() => {
    actions.setLoadingNFTs(loadingNFTs)
  },[loadingNFTs])
  useEffect(() => {
    actions.setLoadingMyNFTs(loadingMyNFTs)
  },[loadingMyNFTs])
  useEffect(() => {
    actions.setTotalSupply(totalSupply)
  },[totalSupply])

  useEffect(() => {
    actions.setCreators(creators)
  },[creators])

  useEffect(() => {
    actions.setIPFS(ipfs)
  },[ipfs]);

  useMemo(() => {
    if(!loadingNFTs && ipfs &&!pinning){
      setPinning(true)
      nfts.map(async string => {
        const obj = JSON.parse(string);
        await ipfs.pin.add(obj.tokenUri.replace("ipfs://",""))
        await ipfs.pin.add(obj.metadata.image.replace("ipfs://",""))
        return(string);
      })
    }
  },[ipfs,nfts,loadingNFTs,pinning])
  return (
    <Main>


      <AppContext.Provider value={{ state, actions }}>

        <Router>
        <Menu />

        <Box>
          {
            netId !== 4 && netId !== 0x64 && coinbase &&
            <center>
              <p><b>Wrong network</b></p>
              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" external>Please connect to xDai network <IconLink /></Link></p>
            </center>

          }
          <Switch>

            <Route path="/home" component={Home}/>
            <Route path="/all-avatars" component={AllAvatars}/>
            <Route path="/mint" component={Mint}/>
            <Route path="/profile" component={Profile}/>
            <Route path="/profiles/:address" component={UserProfile}/>

            <Route path="/games" component={GamesPage}/>
            <Route path="/tokens/:id" component={Histories}/>
            <Route path="/activities" component={Activities}/>
            <Route path="/governance" component={Governance}/>
            <Route path="/callback" component={CallbackUNSLogin}/>
            <Route render={() => {

              return(
                <Redirect to="/mint" />
              );

            }} />
          </Switch>

        </Box>
        </Router>
        <center style={{marginTop: "5px",fontSize: '10px'}}>
          <h4>Other projects from HashAvatars</h4>
          <Link href="https://snowflakeshash.com" external><img alt="" style={{width: "10px"}} src="https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu" />SnowflakesHash</Link>
        </center>
        <footer style={{textAlign: "center",marginTop: "50px"}}>
          <Link href="https://t.me/thehashavatars" external>Telegram<IconLink /></Link>
          <Link href="https://twitter.com/thehashavatars" external>Twitter<IconLink /></Link>
          <Link href="https://github.com/henrique1837/hashavatars-dapp" external>Github<IconLink /></Link>
          <Link href="https://www.xpollinate.io/" external>Bridge<IconLink /></Link>

        </footer>


      </AppContext.Provider>


    </Main>
  );
}

export default App;
