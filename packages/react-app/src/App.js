import React,{useEffect,useState} from "react";
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
  const {hashavatars,creators,nfts,loadingNFTs,myNfts,totalSupply} = useContract();
  const { state, actions } = useAppState()
  const [nftsLength,setNftsLength] = useState();
  const [previousCoinbase,setPrevCoinbase] = useState();

  useEffect(() => {
    if((provider && netId) || (coinbase !== previousCoinbase)){
      actions.setProvider(provider);
      actions.setNetId(netId);
      actions.setCoinbase(coinbase);
      setPrevCoinbase(coinbase);
    }


    if(hashavatars){
      actions.setHashAvatars(hashavatars)
    }
    if(nfts && nftsLength !== nfts.length){
      actions.setNfts(nfts)
      setNftsLength(nfts.length);
      if(myNfts){
        actions.setMyNfts(myNfts)
      }
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
  },[actions,provider,coinbase,netId,hashavatars,nfts,myNfts,loadingNFTs,creators,totalSupply]);
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
                <Redirect to="/mint" />
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
