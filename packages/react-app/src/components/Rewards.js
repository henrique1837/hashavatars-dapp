import React,{useState} from "react";
import { Image } from 'react-bootstrap';
import { Button,IdentityBadge,EthIdenticon,Header,Tabs,IconLink } from '@aragon/ui';
import useWeb3Modal from '../hooks/useWeb3Modal';

import { Link } from 'react-router-dom';
function Menu(){
  const {loadWeb3Modal,coinbase,netId,profile} = useWeb3Modal();


  return(
    <>


    </>
  )
}


export default Menu;
