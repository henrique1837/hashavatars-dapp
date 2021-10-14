import React,{useEffect,useState} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { Main,Box,Link,IconLink } from '@aragon/ui';

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
import Mint from "./screens/Mint";
import Profile from "./screens/Profile";
import UserProfile from "./screens/UserProfile";

//import DAO from "./screens/DAO";
import Histories from "./screens/HashHistories";

import GamesPage from "./screens/Games";

//import Feedbacks from "./screens/Feedbacks";

import AllAvatars from "./screens/AllAvatars";

import Menu from "./components/Menu";


//import GET_TRANSFERS from "./graphql/subgraph";


function App() {

  const {provider,coinbase,netId,profile} = useWeb3Modal();
  const {hashavatars,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply} = useContract();
  const { state, actions } = useAppState()
  const [nftsLength,setNftsLength] = useState();
  const [myNftsLength,setMyNftsLength] = useState();
  const [myOwnedNftsLength,setMyOwnedNftsLength] = useState();

  const [previousCoinbase,setPrevCoinbase] = useState();
  const [previousNetId,setPrevsNetId] = useState();
  const [previousHashAvatars,setPrevsHashAvatars] = useState();

  useEffect(() => {
    if((coinbase !== previousCoinbase) || (netId !== previousNetId) ){
      actions.setProvider(provider);
      actions.setNetId(netId);
      actions.setCoinbase(coinbase);
      actions.setProfile(profile);

      setPrevCoinbase(coinbase);
      setPrevsNetId(netId);
    }


    if(hashavatars !== previousHashAvatars){
      actions.setHashAvatars(hashavatars)
      setPrevsHashAvatars(previousHashAvatars)
    }
    if(nfts && nftsLength !== nfts.length){
      actions.setNfts(nfts)
      setNftsLength(nfts.length);
    }

    if(myNfts && myNftsLength !== myNfts.length){
      actions.setMyNfts(myNfts);
      setMyNftsLength(myNfts.length);
    }
    if(myOwnedNfts && myOwnedNftsLength !== myOwnedNfts.length){
      actions.setMyOwnedNfts(myOwnedNfts);
      setMyOwnedNftsLength(myOwnedNfts.length);
    }

    if(!loadingNFTs){
      actions.setLoadingNFTs(loadingNFTs)
    }
    if(totalSupply){
      actions.setTotalSupply(totalSupply)
    }
    if(creators){
      actions.setCreators(creators)
    }
  },[
    actions,
    provider,
    coinbase,
    netId,
    hashavatars,
    nfts,
    myNfts,
    loadingNFTs,
    creators,
    totalSupply,
    myNftsLength,
    nftsLength,
    previousCoinbase,
    myOwnedNfts,
    myOwnedNftsLength,
    profile
  ]);
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



            {/*<Route path="/feedbacks" component={Feedbacks}/>*/}
            <Route render={() => {

              return(
                <Redirect to="/mint" />
              );

            }} />
          </Switch>

        </Box>
        </Router>
        <footer style={{textAlign: "center",marginTop: "50px"}}>
          <Link href="https://t.me/thehashavatars" external>Telegram<IconLink /></Link>
          <Link href="https://twitter.com/thehashavatars" external>Twitter<IconLink /></Link>
          <Link href="https://github.com/henrique1837/hashavatars-dapp" external>Github<IconLink /></Link>
          <Link href="https://www.xpollinate.io/" external>Bridge<IconLink /></Link>
          <Link href="https://dweb.link/ipfs/bafybeidakaaxs7hgnpdcu6t67cvajys3jyj3jcrkoi5teji564jd74cuw4" external>Previous Version<IconLink /></Link>
          {
            netId === 4 &&
            <Link href="https://client.aragon.org/#/hashavatars/" external>DAO<IconLink /></Link>

          }
        </footer>

      </AppContext.Provider>


    </Main>
  );
}

export default App;
