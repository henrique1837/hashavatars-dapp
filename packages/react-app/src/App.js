import React,{useEffect} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { Main,Header,Box } from '@aragon/ui';

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
import Mint from "./screens/Mint";
import AllAvatars from "./screens/AllAvatars";

import Menu from "./components/Menu";


//import GET_TRANSFERS from "./graphql/subgraph";


function App() {

  const [provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId] = useWeb3Modal();
  const [hashavatars,creators,nfts,loadingNFTs,myNfts] = useContract();
  const { state, actions } = useAppState()
  useEffect(() => {
    if(provider){
      actions.setProvider(provider)
    }
    if(coinbase){
      actions.setCoinbase(coinbase)
    }
    if(netId){
      actions.setNetId(netId)
    }
    if(hashavatars){
      actions.setHashAvatars(hashavatars)
    }
    if(nfts){
      actions.setNfts(nfts)
    }
    if(myNfts){
      actions.setMyNfts(myNfts)
    }
    if(!loadingNFTs){
      actions.setLoadingNFTs(loadingNFTs)
    }
    if(creators){
      actions.setCreators(creators)
    }
  },[actions,provider,coinbase,netId,hashavatars,nfts,myNfts,loadingNFTs,creators]);
  return (
    <Main>

      <Header>
        <Menu />
      </Header>
      {
        netId !== 4 && netId !== 0x64 && coinbase &&
        <center>Wrong network</center>
      }
      <Box>
      <AppContext.Provider value={{ state, actions }}>

        <Router>
          <Switch>

            <Route path="/home" component={Home}/>
            <Route path="/all-avatars" component={AllAvatars}/>
            <Route path="/mint" component={Mint}/>

            <Route render={() => {

              return(
                <Redirect to="/home" />
              );

            }} />
          </Switch>

        </Router>

      </AppContext.Provider>


      </Box>
    </Main>
  );
}

export default App;
