import { useMemo, useState,useCallback } from "react";
import { addresses, abis } from "@project/contracts";
import { ethers } from "ethers";

import { useAppContext } from './useAppState'

function useLikes() {

  const { state } = useAppContext();
  const [likes,setLikes] = useState();
  const [liking,setLiking] = useState(false);

  const getLikes = useCallback(async (id) => {
    const totalLikes = Number(await likes.likes(id));
    return(totalLikes)
  },[likes]);

  const getLiked = useCallback(async (id) => {
    const liked = await likes.liked(state.coinbase,id);
    return(liked)
  },[likes,state.coinbase]);

  const like = useCallback(async (id) => {
    try{
      setLiking(true);
      const signer = state.provider.getSigner();
      const likesWithSinger = likes.connect(signer);
      const tx = await likesWithSinger.like(id);
      await tx.wait();
      setLiking(false);
      return(tx);
    } catch(err){
      setLiking(false)
      throw(err);
    }
  },[likes,state.provider]);
  const unlike = useCallback(async (id) => {
    try{
      setLiking(true);
      const signer = state.provider.getSigner();
      const likesWithSinger = likes.connect(signer);
      const tx = await likesWithSinger.unlike(id);
      await tx.wait();
      setLiking(false);
      return(tx);
    } catch(err){
      setLiking(false)
      throw(err);
    }
  },[likes,state.provider]);
  useMemo(() => {
    if(!likes && state.provider && state.netId){
      if(state.netId === 4){
        setLikes(new ethers.Contract(addresses.likes.rinkeby,abis.likes,state.provider))
      } else {
        setLikes(new ethers.Contract(addresses.likes.xdai,abis.likes,state.provider))
      }
    }
  },[likes,state.provider,state.netId])



  return({likes,like,unlike,getLiked,getLikes,liking})
}

export default useLikes;
