import { useCallback,useMemo, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const INFURA_ID = "INVALID_INFURA_KEY";

const NETWORK_NAME = "xdai";

function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const [coinbase, setCoinbase] = useState();
  const [netId , setNetId] = useState();
  const [noProvider , setNoProvider] = useState(window.ethereum);

  const [autoLoaded, setAutoLoaded] = useState(false);
  const { autoLoad = true, infuraId = INFURA_ID, NETWORK = NETWORK_NAME } = config;
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const providerOptions = {
    injected: {
      package: null
    },
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

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    const newProvider = await web3Modal.connect();
    const web3 = new Web3(newProvider);
    const newCoinbase = await web3.eth.getCoinbase();
    const netId = await web3.eth.net.getId();

    setProvider(web3);
    setCoinbase(newCoinbase);
    setNetId(netId);
    newProvider.on('accountsChanged', accounts => window.location.reload(true));
    newProvider.on('chainChanged', chainId => window.location.reload(true));
    // Subscribe to provider disconnection
    newProvider.on("disconnect", async (error: { code: number; message: string }) => {
      await web3Modal.clearCachedProvider();
      window.location.reload(true);
    });
    return;
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      window.location.reload();
    },
    [web3Modal],
  );


  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.

  useMemo(() => {

    if(!noProvider){
      setProvider(new Web3("https://rpc.xdaichain.com/"));
      setNetId(0x64);
      setNoProvider(true);
    }

    if (autoLoad && !autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal.cachedProvider,coinbase,provider,netId,noProvider]);

  return [provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId];
}

export default useWeb3Modal;
