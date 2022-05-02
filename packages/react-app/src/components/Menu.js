import React,{useState,useMemo} from "react";
import { Button,IdentityBadge,EthIdenticon,Header,Tabs,IconLink,LoadingRing } from '@aragon/ui';
import { useAppContext } from '../hooks/useAppState'

import { Link,Redirect,useLocation } from 'react-router-dom';
function Menu(){
  const { state } = useAppContext();

  const location = useLocation();
  const [selected, setSelected] = useState();

  useMemo(() => {
    if(!selected && location){
      if(location.pathname === "/home"){
        setSelected(0);
      }
      if(location.pathname === "/mint"){
        setSelected(1);
      }
      if(location.pathname === "/all-avatars"){
        setSelected(2);
      }
      if(location.pathname === "/activities"){
        setSelected(3);
      }
      if(location.pathname === "/profile"){
        setSelected(4);
      }
      if(location.pathname === "/governance"){
        setSelected(5);
      }

    }
  },[selected,location])

  return(
    <>
    <Header
      primary={
        <>
          <h2>HashAvatars</h2>
          {
            state.netId &&
            (
              state.netId === 4 ?
              <>
              <img src="data:image/png;base64,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" style={{width: '25px'}}/>
              <small>RINKEBY</small>
              </> :
              state.netId === 0x64 ?
              <>
              <img src={require("../assets/xdai-logo.png")} style={{width: '25px'}}/>
              <small>XDAI</small>
              </> :
              "WRONG NETWORK"
            )
          }
        </>
      }
      secondary={
        <>
        {
          state.coinbase ?
          <IdentityBadge
            customLabel={state.profile?.name}
            entity={state.coinbase}
            connectedAccount
            popoverTitle={state.profile?.name}
            popoverAction={{label:"Edit profile",onClick: () => {window.open(`https://self.id/${state.coinbase}`,"_blank")}}}
            icon={state.profile?.image ?
                  <img src={state.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                  <EthIdenticon address={state.coinbase}/>
            }
          /> :
          !state.connecting ?
          <Button
            onClick={() => {
              state.loadWeb3Modal();
            }}
          >
            Connect Wallet
          </Button> :
          <center><p><LoadingRing/><small>Connecting wallet ...</small></p></center>
        }
        </>
      }
    />
    <Tabs
      items={
        [
          <Link to="/home" style={{textDecoration: "none"}}>Informations</Link>,
          <Link to="/mint" style={{textDecoration: "none"}}><b>Generate Avatar</b></Link>,
          <Link to="/all-avatars" style={{textDecoration: "none"}}>All Avatars</Link>,
          <Link to="/activities" style={{textDecoration: "none"}}>Activities</Link>,
          state.coinbase && <Link to="/profile" style={{textDecoration: "none"}}>Profile</Link>,
          state.netId === 4 && <Link to="/governance" style={{textDecoration: "none"}}>Governance</Link>,

        ]
      }
      selected={selected}
      onChange={setSelected}
    />
    {
      selected === 0 &&
      <Redirect to={"/home"} />
    }
    {
      selected === 1 &&
      <Redirect to={"/mint"} />
    }
    {
      selected === 2 &&
      <Redirect to={"/all-avatars"} />
    }
    {
      selected === 3 &&
      <Redirect to={"/activities"} />
    }
    {
      selected === 4 && state.coinbase &&
      <Redirect to={"/profile"} />
    }
    {
      selected === 5 && state.coinbase && state.netId === 4 &&
      <Redirect to={"/governance"} />
    }

    </>
  )
}


export default Menu;
