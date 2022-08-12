import React,{ useState,useMemo,useContext } from 'react'




/**
 * Our custom React hook to manage state
 */

 const AppContext = React.createContext({})



const useAppState = () => {
  const initialState = {
    loadWeb3Modal: null,
    hashavatars: null,
    coinbase: null,
    loadingNFTs: true,
    loadingMyNFTs: true,
    netId: null,
    nfts: [],
    myNfts: [],
    myOwnedNfts: [],
    creators: [],
    profile: null,
    connecting: false,
    getMetadata: null,
    getTotalSupply: null,
    client: null,
    ipfs: null,
    gateways : [
      'https://dweb.link/ipfs/',
      'https://nftstorage.link/ipfs/',
      'https://ipfs.io/ipfs/'
    ]
  }

  // Manage the state using React.useState()
  const [state, setState] = useState(initialState)

  // Build our actions. We'll use useMemo() as an optimization,
  // so this will only ever be called once.
  const actions = useMemo(() => getActions(setState), [setState])

  return { state, actions }
}

// Define your actions as functions that call setState().
// It's a bit like Redux's dispatch(), but as individual
// functions.
const getActions = (setState) => ({
  setProvider: (provider) => {
    setState((state) => ({ ...state, provider: provider }))
  },
  setHashAvatars: (hashavatars) => {
    setState((state) => ({ ...state, hashavatars: hashavatars }))
  },
  setNetId: (netId) => {
    setState((state) => ({ ...state, netId: netId }))
  },
  setCoinbase: (coinbase) => {
    setState((state) => ({ ...state, coinbase: coinbase }))
  },
  setNfts: (nfts) => {
    setState((state) => ({ ...state, nfts: nfts }))
  },
  setMyNfts: (myNfts) => {
    setState((state) => ({ ...state, myNfts: myNfts }))
  },
  setMyOwnedNfts: (myOwnedNfts) => {
    setState((state) => ({ ...state, myOwnedNfts: myOwnedNfts }))
  },
  setLoadingNFTs: (loading) => {
    setState((state) => ({ ...state, loadingNFTs: loading }))
  },
  setLoadingMyNFTs: (loading) => {
    setState((state) => ({ ...state, loadingMyNFTs: loading }))
  },
  setCreators: (creators) => {
    setState((state) => ({ ...state, creators: creators }))
  },
  setTotalSupply: (supply) => {
    setState((state) => ({ ...state, totalSupply: supply }))
  },
  setProfile: (profile) => {
    setState((state) => ({ ...state, profile: profile }))
  },
  setConnecting: (connecting) => {
    setState((state) => ({ ...state, connecting: connecting }))
  },
  setLoadWeb3Modal: (loadWeb3Modal) => {
    setState((state) => ({ ...state, loadWeb3Modal: loadWeb3Modal }))
  },
  setGetMetadata: (getMetadata) => {
    setState((state) => ({ ...state, getMetadata: getMetadata }))
  },
  setGetTotalSupply: (getTotalSupply) => {
    setState((state) => ({ ...state, getTotalSupply: getTotalSupply }))
  },
  setClient: (client) => {
    setState((state) => ({ ...state, client: client }))
  },
  setIPFS: (ipfs) => {
    setState((state) => ({ ...state, ipfs: ipfs }))
  },
})


const useAppContext = () => {
  return useContext(AppContext)
}

export { AppContext, useAppState, useAppContext }
