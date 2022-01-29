import React,{useEffect,useState} from "react";
import { ethers } from "ethers";

import UAuthSPA from '@uauth/js'
import * as UAuthWeb3Modal from '@uauth/web3modal'
import  { Redirect } from 'react-router-dom';
import {  useAppState } from '../hooks/useAppState'
import  {web3Modal,uauthOptions}  from '../hooks/useWeb3Modal'

// On page load...

function CallbackUNSLogin(){
  const { actions } = useAppState();

  const [redirectTo, setRedirectTo] = useState()

  useEffect(() => {
      // Try to exchange authorization code for access and id tokens.
      UAuthWeb3Modal.getUAuth(UAuthSPA, uauthOptions)
        .loginCallback()
        .then(async () => {
          const conn = await web3Modal.connectTo('custom-uauth');
          // Save provider in state and redirect to success page

          const newProvider = new ethers.providers.Web3Provider(conn,"any");
          const signer = newProvider.getSigner()
          const newCoinbase = await signer.getAddress();
          const {chainId} = await newProvider.getNetwork();
          actions.setProvider(newProvider);
          actions.setCoinbase(newCoinbase);
          actions.setNetId(chainId);

          setRedirectTo('/');

        })
        .catch(error => {
          // Redirect to failure page
          setRedirectTo('/');

        })
    }, []);
    if (redirectTo) {
      return <Redirect to={redirectTo} />
    }

    return <>Loading...</>
}

export default CallbackUNSLogin;
