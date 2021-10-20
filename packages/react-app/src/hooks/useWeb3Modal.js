import { useCallback,useMemo, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import ethProvider from "eth-provider";

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
      window.location.reload();
    },
    [web3Modal],
  );
  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    try{
      const newProvider = await web3Modal.connect();
      const web3 = new Web3(newProvider);
      const newCoinbase = await web3.eth.getCoinbase();
      const netId = await web3.eth.net.getId();
      let profile;
      try{
        profile = await getLegacy3BoxProfileAsBasicProfile(newCoinbase);
        setProfile(profile);
      } catch(err){

      }
      setProvider(web3);
      setCoinbase(newCoinbase);
      setNetId(netId);
      setNoProvider(true);
      setAutoLoaded(true);
      newProvider.on('accountsChanged', accounts => window.location.reload(true));
      newProvider.on('chainChanged', chainId => window.location.reload(true));
      // Subscribe to provider disconnection
      newProvider.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      return;
    } catch(err){
      console.log(err);
      logoutOfWeb3Modal();
    }

  }, [web3Modal,logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.

  useMemo(() => {

    if(!noProvider && !window.ethereum?.selectedAddress && !autoLoaded && !web3Modal.cachedProvider){
      setProvider(new Web3("https://rpc.xdaichain.com/"));
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

  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,profile});
}

export default useWeb3Modal;
