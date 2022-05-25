import React,{useMemo,useState,useCallback} from "react";
import ReactDOMServer from 'react-dom/server';
import { useParams } from "react-router-dom";
import { Link as RouterLink } from 'react-router-dom';

import { Container,Row,Col,Spinner } from 'react-bootstrap';
import {
  Button,
  IdentityBadge,
  Link,
  IconLink,
  Split,
  Info,
  SyncIndicator,
  Modal,
  Bar,
  LoadingRing,
  TransactionBadge,
  BackButton,
  IconStar,
  IconStarFilled
} from '@aragon/ui';
import IPFS from 'ipfs-http-client-lite';

import { useAppContext } from '../hooks/useAppState'
import useProfile from "../hooks/useProfile";
import useHashHistories from "../hooks/useHashHistories";
import useLikes from "../hooks/useLikes";

//import useERC20 from "../hooks/useERC20";

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})
function HashHistories(){
  const { state } = useAppContext();


  const {getProfile} = useProfile();
  const {histories} = useHashHistories();
  const {likes,like,unlike,getLiked,getLikes,liking} = useLikes();
  const [totalLikes,setLikes] = useState(null);
  const [liked,setLiked] = useState(null);
  const [metadata,setMetadata] = useState();
  const [creator,setCreator] = useState();
  const [isOwner,setIsOwner] = useState();
  const [text,setText] = useState();
  const [txMsg,setTxMsg] = useState();
  const [uris,setUris] = useState([]);
  const [loading,setLoading] = useState(true);
  const [loadingHistories,setLoadingHistories] = useState(true);

  const {id} = useParams();

  const [opened, setOpened] = useState(false)


  const [err,setErr] = useState(false);

  const handleOnChange = (e) => {
    if(e.target.value === ""){
      setText(null);
    }
    setText(e.target.value);
  }

  const addUri = useCallback(async (type) => {
    setTxMsg(
      <center>
       <LoadingRing />
       <p><small>Storing in IPFS</small></p>
      </center>
    );
    try{
      if(!text){
        return
      }

      const res = await ipfs.add(text);
      const uri = res[0].hash;
      setTxMsg(
        <center>
         <LoadingRing />
         <p><small>Approve transaction</small></p>
        </center>
      );
      const signer = state.provider.getSigner();
      const historiesWithSigner = histories.connect(signer);
      const tx = await historiesWithSigner.addUri(id,uri,{});

      setTxMsg(
        <center>
         <LoadingRing />
         <p><small>Tx sent <TransactionBadge transaction={tx.hash} networkType={state.netId === 4 ? "rinkeby" : "xdai"} /></small></p>
        </center>
      );
      await tx.wait();
      setTxMsg(
        <center>
         <p><small>Transaction confirmed!</small></p>
        </center>
      );
      setTimeout(() => {
        setTxMsg(null)
        setText(null);
        setOpened(false);
      },5000);
    } catch(err){
      setTxMsg(
        <center>
         <p><small>{err.message}</small></p>
        </center>
      );
      setTimeout(() => {
        setTxMsg(null)
      },5000);
    }
  },[histories,state.coinbase,text])

  const likeToken = useCallback(async () => {
    await like(id);
    const newLiked = await getLikes(id);
    const newLikes = await getLiked(id);
    return(newLikes)
  },[likes,like,state.coinbase,id,getLikes,getLiked])

  const unlikeToken = useCallback(async () => {
    await unlike(id);
    const newLiked =await getLikes(id);
    const newLikes = await getLiked(id);
    setLiked(newLiked);
    setLikes(newLikes);
  },[likes,unlike,state.coinbase,id,,getLikes,getLiked])
  useMemo(async() => {
    if(!metadata && id && state.hashavatars && histories ){
      try{
        const obj = JSON.parse(
          state.nfts.filter(string => {
            const objStr = JSON.parse(string);
            return(
              Number(objStr.returnValues._id) === Number(id)
            )
          })
        )

        let metadataToken;
        let uriToken;
        let newCreator;
        if(obj){
          //alert(obj.returnValues._id)
          //uriToken = obj.returnValues._id;
          metadataToken = obj.metadata;
          newCreator = obj.creator;
        } else {
          uriToken = await state.hashavatars.uri(id);
          metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])}`)).text());
          newCreator = await state.hashavatars.creators(id);
        }
        setMetadata(metadataToken);
        setCreator({
          address: newCreator,
          profile: null
        });
        getProfile(newCreator).then(profile => {
          setCreator({
            address: newCreator,
            profile: profile
          });
        });


        setLoading(false);
        if(state.coinbase){
          const balance = await state.hashavatars.balanceOf(state.coinbase,id)
          if(balance > 0){
            const historyTold = await histories.uriAdded(state.coinbase,id);
            setIsOwner(!historyTold);
          }
        }
        const filter = histories.filters.UriAdded(null,Number(id));
        // Change here for thegraph //
        const events = await histories.queryFilter(filter,0,'latest');
        if(events.length === 0){
          setLoadingHistories(false)
        }
        const newUris = [];
        for(let res of events){
          const string = await (await fetch(`${state.gateways[Math.floor(Math.random()*state.gateways.length)]}${res.args.uri}`)).text()
          newUris.push(string);
          setUris(newUris);

        }
        setLoadingHistories(false);

        // thegraph
        histories.on(filter,async (from,tokenId,uri) => {
          setLoadingHistories(true);
          const string = await (await fetch(`${state.gateways[Math.floor(Math.random()*state.gateways.length)]}${uri}`)).text()
          const newUris = [...uris,string];
          setUris(newUris);
          if(state.coinbase){
            const balance = await state.hashavatars.balanceOf(state.coinbase,id);
            const historyTold = await histories.uriAdded(state.coinbase,id);
            if(balance > 0){
              setIsOwner(!historyTold);
            }
          }
          setLoadingHistories(false);

        });

      } catch(err){
        console.log(err)
        if(!metadata){
          setErr(true);
        }
      }
    }
  },[uris,metadata,histories,id,state.hashavatars,state.coinbase,state.netId,state.nfts]);

  useMemo(async () => {
    if(likes && id && totalLikes === null){
      if(state.coinbase){
        const newLiked = await getLiked(id);
        setLiked(newLiked);
      }
      const newLikes = await getLikes(id);
      setLikes(newLikes);
    }
  },[likes,state.coinbase,id,totalLikes])

  return(
    <Split
      primary={
        <>
        {
          err && !metadata && !loading &&
          <Info title="Wrong token ID" mode="warning">
            <p>Please select other token ID</p>
          </Info>
        }
        {
          /*
          err && state.netId !== 4 && state.coinbase &&
          <Info title="HashHistories is under progress" mode="info">
            <p>HashHistories and HashAvatars profiles is under progress</p>
            <p>Switch to Rinkeby network if you want to check it</p>
          </Info>
          */
        }
        {
          loading &&
          <SyncIndicator/>

        }
        {
          isOwner && histories && !loadingHistories &&
          <div>
          {
            !txMsg ?
            <Bar primary={<p style={{wordBreak:"break-word"}}>You can write {metadata.name}'s story</p>} secondary={<Button mode="strong" onClick={() => setOpened(true)}>Write story</Button>} /> :
            txMsg
          }
          <Modal visible={opened} onClose={() => setOpened(false)}>
            <h4>Informations</h4>
            <IdentityBadge
              label={"HashStories"}
              entity={histories.address}
              networkType={state.netId === 4 ? "rinkeby" : "xdai"}
              popoverTitle={"HashStories"}
            />
            <p><small>To write a HashAvatar story you must have it in your wallet;</small></p>
            <p><small>You can write it for free (needs to pay gas fee);</small></p>
            <p><small><b>Only new owners of this same token id can continue its story</b>;</small></p>
            <p><small>Ready? Let us know {metadata.name}'s story!</small></p>
            <div><textarea rows="5" cols="40" onChange={handleOnChange} onKeyUp={handleOnChange} id="history"></textarea></div>
            {
              text && !txMsg && <div style={{paddingTop:'10px',paddingBottom:'10px'}}><Button mode="strong" size="small" onClick={() => addUri(3)}>Add story</Button></div>
            }
            {
              /*
              text && !txMsg &&<div><Button mode="strong" size="small" onClick={() => addUri(0)}>Add story with 0.1 XDAI</Button></div>
            }
            {
              text && (approvedCold > 0) && !txMsg ?
              <div style={{paddingTop:'10px'}}><Button mode="strong" size="small" onClick={() => addUri(1)}>Add story with 0.1 COLD</Button></div> :
              text && !txMsg &&
              <div style={{paddingTop:'10px'}}><Button mode="strong" size="small" onClick={() => approveCold(histories.address)}>Approve COLD</Button></div>
              */
            }
            {
              txMsg
            }
          </Modal>
          </div>
        }
        <div style={{wordBreak:"break-word"}}>
        <h4 style={{wordBreak:"break-all"}}>Story {metadata && <>of {metadata?.name}</>}</h4>
        {
          loadingHistories &&
          <center>
          <p><LoadingRing /></p>
          <p><small>Loading stories ...</small></p>
          </center>
        }
        {
          uris?.map(string => {
            return(<p>{string}</p>)
          })
        }
        </div>
        </>
      }
      secondary={

        <div>
          {
            loading &&
            <center><LoadingRing /></center>
          }
          <div>
            <center>
              <img src={metadata?.image.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} width="150px"/>
            </center>
            <p>ID: {id}</p>
            {
              state.hashavatars && state.netId &&
              <>
              <p><small><Link href={`https://epor.io/tokens/${state.hashavatars.address}/${id}`} external={true}><IconLink />View on Epor.io</Link></small></p>
              </>
            }
            {
              state.hashavatars && state.netId && isOwner &&
              <p><small><Link href="https://xdai-omnibridge-nft-staging.web.app/bridge" external><IconLink />NFT Bridge</Link></small></p>
            }
            {
              totalLikes >= 0 &&
              <p>
                Likes: {totalLikes}
                {
                  state.coinbase &&
                  (
                    liking ?
                    <LoadingRing/> :
                    liked ?
                    <IconStarFilled alt="Unlike" onClick={() => {unlikeToken()}}/> :
                    <IconStar alt="Like"  onClick={() => {likeToken()}}/>
                  )
                }
               </p>
            }

          </div>
          <div>
            <h5>Creator</h5>
            {
              creator &&
              <div>
                <div>
                <RouterLink to={`/profiles/${creator.address}`} style={{textDecoration: "none"}}>

                <IdentityBadge
                  label={creator.profile?.name}
                  entity={creator.address}
                  networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                  popoverTitle={creator.profile?.name }
                />
                </RouterLink>
                </div>
                {
                  creator.profile?.image &&
                  <div>
                    <img
                      rounded
                      src={creator.profile.image.original.src.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])}
                      style={{width: '250px',heigth: "250px"}}
                    />
                  </div>
                }
                <p>{creator.profile?.description}</p>
                {
                  creator.profile?.url &&
                  <p><Link href={creator.profile?.url.includes("https://") ? creator.profile.url : `https://${creator.profile.url}` } external={true}>{creator.profile?.url} <IconLink  /></Link></p>
                }
                <div style={{paddingTop:"60px"}}>
                <BackButton as={RouterLink} to={"/all-avatars"} style={{textDecoration: "none"}} />
                </div>
              </div>
            }
          </div>
        </div>

      }
    />

  )
}

export default HashHistories;
