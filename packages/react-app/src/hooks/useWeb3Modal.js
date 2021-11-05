import { useCallback,useMemo, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';

//import WalletConnectProvider from "@walletconnect/web3-provider";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const INFURA_ID = "INVALID_INFURA_KEY";

const NETWORK_NAME = "xdai";

function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const [coinbase, setCoinbase] = useState();
  const [profile,setProfile] = useState();
  const [netId , setNetId] = useState();
  const [connecting , setConnecting] = useState();

  const [noProvider , setNoProvider] = useState();
  const [autoLoaded, setAutoLoaded] = useState(false);
  const { autoLoad = true, infuraId = INFURA_ID, NETWORK = NETWORK_NAME } = config;
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const providerOptions = {
    injected: {
      package: null
    },
    /*
    frame: {
      package: ethProvider // required
    }
    /*
    torus: {
      package: Torus, // required
      options: {
        networkParams: {
          chainId: 0x64, // optional
          networkId: 0x64 // optional
        }
      }
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId,
      },
    }
    */
  };
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      setCoinbase();
      setProfile()
      setNetId(0x89);
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.xdaichain.com/"));
    },
    [web3Modal],
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
      conn.on('accountsChanged', accounts => {
        const newProvider = new ethers.providers.Web3Provider(conn,"any");
        setProvider(newProvider)
        setCoinbase(accounts[0]);
      });
      conn.on('chainChanged', async chainId => {
        const newProvider = new ethers.providers.Web3Provider(conn,"any");
        setProvider(newProvider)
        setNetId(Number(chainId))
      });
      // Subscribe to provider disconnection
      conn.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      setConnecting(false);
      let profile;
      try{
        profile = await getLegacy3BoxProfileAsBasicProfile(newCoinbase);
        setProfile(profile);
      } catch(err){

      }
      return;
    } catch(err){
      console.log(err);
      setConnecting(false)
      logoutOfWeb3Modal();
    }

  }, [web3Modal,logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.

  useMemo(() => {

    if(!noProvider && !window.ethereum?.selectedAddress && !autoLoaded && !web3Modal.cachedProvider && !connecting){
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.xdaichain.com"));
      setNetId(0x64);
      setNoProvider(true);
    }

    if (!autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setNoProvider(true);
      setAutoLoaded(true);
    }

  },[
     autoLoaded,
     loadWeb3Modal,
     setAutoLoaded,
     web3Modal.cachedProvider,
     noProvider
   ]);

  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,profile,connecting});
}

export default useWeb3Modal;
