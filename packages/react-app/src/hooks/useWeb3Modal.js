import { useCallback,useMemo, useState,useEffect } from "react";
import { ethers } from "ethers";
import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'
import Web3Modal from "web3modal";
import { getLegacy3BoxProfileAsBasicProfile } from '@self.id/3box-legacy';
import WalletConnectProvider from "@walletconnect/web3-provider";

// These options are used to construct the UAuthSPA instance.
const uauthOptions: IUAuthOptions = {
  clientID: 'fb0fdb76-f45d-454c-ab06-84370ef9e59a',
  redirectUri: 'https://thehashavatars-crypto.ipns.dweb.link',
  //redirectUri: 'http://127.0.0.1:3000',
  // Must include both the openid and wallet scopes.
  scope: 'openid wallet',
}

const providerOptions = {

  // Currently the package isn't inside the web3modal library currently. For now,
  // users must use this libary to create a custom web3modal provider.

  // All custom `web3modal` providers must be registered using the "custom-"
  // prefix.
  'custom-uauth': {
    // The UI Assets
    display: UAuthWeb3Modal.display,

    // The Connector
    connector: UAuthWeb3Modal.connector,

    // The SPA libary
    package: UAuthSPA,

    // The SPA libary options
    options: uauthOptions,
  },
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc:{
        100: "https://rpc.gnosischain.com/"
      }
    }
  }


};


const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions
});
// Register the web3modal so the connector has access to it.
UAuthWeb3Modal.registerWeb3Modal(web3Modal)
export {web3Modal,uauthOptions};
function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const [coinbase, setCoinbase] = useState();
  const [profile,setProfile] = useState();
  const [netId , setNetId] = useState();
  const [connecting , setConnecting] = useState();
  const [noProvider , setNoProvider] = useState();
  //const [cyberConnect , setCyberConnect] = useState();

  const [autoLoaded, setAutoLoaded] = useState(false);
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      setCoinbase();
      setProfile()
      setNetId(0x64);
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/"));
    },
    [],
  );
  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    try{
      setConnecting(true)
      setAutoLoaded(true);
      const conn = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(conn,"any");
      const signer = newProvider.getSigner()
      const newCoinbase = await signer.getAddress();
      const {chainId} = await newProvider.getNetwork();
      setProvider(newProvider);
      setCoinbase(newCoinbase);
      setNetId(chainId);
      setNoProvider(true);
      setConnecting(false);

      conn.on('accountsChanged', accounts => {
        const newProvider = new ethers.providers.Web3Provider(conn,"any");
        setProvider(newProvider)
        setCoinbase(accounts[0]);
      });
      conn.on('chainChanged', async chainId => {
        window.location.reload();
      });
      // Subscribe to provider disconnection
      conn.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      conn.on("close", async () => {
        logoutOfWeb3Modal();
      });

      return;
    } catch(err){
      console.log(err);
      setConnecting(false)
      logoutOfWeb3Modal();
    }

  }, [logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useMemo(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      setAutoLoaded(true);
      loadWeb3Modal();
      setNoProvider(true);
    }
  },[autoLoaded,loadWeb3Modal]);
  useMemo(() => {

    if(!noProvider && !autoLoaded && !web3Modal.cachedProvider && !connecting){
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/"));
      setNetId(0x64);
      setNoProvider(true);
      setAutoLoaded(true);
    }



  },[
    noProvider,
    autoLoaded,
    connecting
   ]);

  useEffect(() => {
    if(coinbase){
      getLegacy3BoxProfileAsBasicProfile(coinbase)
      .then(profile => {
        setProfile(profile);
      });
    }
  },[coinbase])

  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,profile,connecting});
}



export default useWeb3Modal;
