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
  BackButton
} from '@aragon/ui';
import IPFS from 'ipfs-http-client-lite';

import { useAppContext } from '../hooks/useAppState'
import useProfile from "../hooks/useProfile";
import useHashHistories from "../hooks/useHashHistories";
import useERC20 from "../hooks/useERC20";

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})
function HashHistories(){
  const { state } = useAppContext();

  const {cold,coldBalance,approvedCold,approveCold} = useERC20();

  const {getProfile} = useProfile();
  const {histories} = useHashHistories();
  const [metadata,setMetadata] = useState();
  const [creator,setCreator] = useState();
  const [isOwner,setIsOwner] = useState();
  const [text,setText] = useState();
  const [txMsg,setTxMsg] = useState();
  const [uris,setUris] = useState([]);
  const [loading,setLoading] = useState(true);
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
      const price = await histories.price();
      const signer = state.provider.getSigner();
      const historiesWithSigner = histories.connect(signer);
      let tx;
      if(type === 0){
        tx = await historiesWithSigner.addUri(id,uri,{
          value: price,
          gasPrice: 1000000000
        });
      } else if(type === 1) {
        tx = await historiesWithSigner.addUriWithERC20(id,uri,{
          gasPrice: 1000000000
        });
      } else {
        tx = await historiesWithSigner.addUri(id,uri,{
          gasPrice: 1000000000
        });
      }
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
          metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
          newCreator = await state.hashavatars.creators(id);
        }
        fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
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
        const filter = histories.filters.UriAdded(null,id,null);

        const events = await histories.queryFilter(filter,0,'latest');
        events.map(async res=>{
          const string = await (await fetch(`https://ipfs.io/ipfs/${res.args.uri}`)).text()
          setUris([...uris,string])
          return(string)
        });
        if(state.coinbase){
          const balance = await state.hashavatars.balanceOf(state.coinbase,id);
          const historyTold = await histories.uriAdded(state.coinbase,id);
          if(balance > 0 && !historyTold){
            setIsOwner(true);
          }
        }
        histories.on(filter,async (from,tokenId,uri) => {
          const string = await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text()
          const newUris = [...uris,string];
          setUris(newUris);
          if(state.coinbase){
            const balance = await state.hashavatars.balanceOf(state.coinbase,id);
            const historyTold = await histories.uriAdded(state.coinbase,id);
            if(balance > 0){
              setIsOwner(historyTold);
            }
          }
        });
      } catch(err){
        console.log(err)
        if(!metadata){
          setErr(true);
        }
      }
    }
  },[uris,metadata,histories,id,state.hashavatars,state.coinbase,state.netId,state.nfts]);

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
          err && state.netId !== 4 && state.coinbase &&
          <Info title="HashHistories is under progress" mode="info">
            <p>HashHistories and HashAvatars profiles is under progress</p>
            <p>Switch to Rinkeby network if you want to check it</p>
          </Info>
        }
        {
          (!metadata || !creator || !id) &&
          <SyncIndicator/>

        }
        {
          isOwner && histories && state.netId === 4 &&
          <div>
          {
            !txMsg ?
            <Bar primary={<p>You can write {metadata.name}'s history</p>} secondary={<Button mode="strong" onClick={() => setOpened(true)}>Write history</Button>} /> :
            txMsg
          }
          <Modal visible={opened} onClose={() => setOpened(false)}>
            <h4>Informations</h4>
            <IdentityBadge
              label={"HashHistories"}
              entity={histories.address}
              networkType={state.netId === 4 ? "rinkeby" : "xdai"}
              popoverTitle={"HashHistories"}
            />
            <p><small>To write a HashAvatar history you must have it in your wallet;</small></p>
            <p><small>You can write it for free (needs to pay gas fee) or by paying 0.1 xdai or 0.1 COLD;</small></p>
            <p><small>If you pays in xdai or COLD you will receive Hash Governance Token (HGT) to participate in our DAO;</small></p>
            <p><small>New owners of this same token id can continue its history;</small></p>
            <p><small>Ready? Let us know {metadata.name}'s history!</small></p>
            <div><textarea rows="5" cols="40" onChange={handleOnChange} onKeyUp={handleOnChange} id="history"></textarea></div>
            {
              text && !txMsg && <div style={{paddingTop:'10px',paddingBottom:'10px'}}><Button mode="strong" size="small" onClick={() => addUri(3)}>Add history for free</Button></div>
            }
            {
              text && !txMsg &&<div><Button mode="strong" size="small" onClick={() => addUri(0)}>Add history with 0.1 XDAI</Button></div>
            }
            {
              text && (approvedCold > 0) && !txMsg ?
              <div style={{paddingTop:'10px'}}><Button mode="strong" size="small" onClick={() => addUri(1)}>Add history with 0.1 COLD</Button></div> :
              text && !txMsg &&
              <div style={{paddingTop:'10px'}}><Button mode="strong" size="small" onClick={() => approveCold(histories.address)}>Approve COLD</Button></div>
            }
            {
              txMsg
            }
          </Modal>
          </div>
        }
        <h4>History {metadata && <>of {metadata?.name}</>}</h4>
        {
          uris?.map(string => {
            return(<div>{string}</div>)
          })
        }
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
              <img src={metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
            </center>
            <p>ID: {id}</p>
            {
              state.hashavatars && state.netId &&
              <p><small><Link href={`https://unifty.io/${state.netId === 4 ? "rinkeby" : "xdai"}/collectible.html?collection=${state.hashavatars.address}&id=${id}`} external={true}><IconLink />View on Unifty.io</Link></small></p>
            }
            {
              state.hashavatars && state.netId && isOwner &&
              <p><small><Link href="https://xdai-omnibridge-nft-staging.web.app/bridge" external><IconLink />NFT Bridge</Link></small></p>
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
                      src={creator.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
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
