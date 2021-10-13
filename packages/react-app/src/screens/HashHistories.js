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
import useWeb3Modal from "../hooks/useWeb3Modal";
import useContract from "../hooks/useContract";
import useProfile from "../hooks/useProfile";
import useHashHistories from "../hooks/useHashHistories";

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})
function HashHistories(){
  const {netId,coinbase} = useWeb3Modal();
  const {hashavatars} = useContract();
  const {getProfile} = useProfile();
  const {histories} = useHashHistories();
  const [metadata,setMetadata] = useState();
  const [creator,setCreator] = useState();
  const [isOwner,setIsOwner] = useState();
  const [text,setText] = useState();
  const [txMsg,setTxMsg] = useState();

  const [uris,setUris] = useState([]);
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
      const price = await histories.methods.price().call();
      if(type === 0){
        await histories.methods.addUri(id,uri).send({
          from: coinbase,
          value: price,
          gasPrice: 1000000000
        }).once('transactionHash',(hash) => {
          setTxMsg(
            <center>
             <LoadingRing />
             <p><small>Tx sent <TransactionBadge transaction={hash} networkType={netId === 4 ? "rinkeby" : "xdai"} /></small></p>
            </center>
          );
        });
        setTxMsg(
          <center>
           <LoadingRing />
           <p><small>Transaction confirmed!</small></p>
          </center>
        );
        setTimeout(() => {
          setTxMsg(null)
          setText(null);
          setOpened(false);
        },5000);
      } else {

      }
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
  },[histories,coinbase,text])

  useMemo(async() => {
    if(!metadata && id && hashavatars && histories ){
      try{
        const uriToken = await hashavatars.methods.uri(id).call();
        const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
        fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
        const newCreator = await hashavatars.methods.creators(id).call();
        const profile = await getProfile(newCreator);
        setCreator({
          address: newCreator,
          profile: profile
        });
        const events = await histories.getPastEvents('UriAdded',{
          filter:{
            tokenId: id
          },
          fromBlock: 0
        });
        events.map(async res=>{
          const string = await (await fetch(`https://ipfs.io/ipfs/${res.returnValues.uri}`)).text()
          setUris([...uris,string])
          return(string)
        });


        setMetadata(metadataToken);
        if(coinbase){
          const balance = await hashavatars.methods.balanceOf(coinbase,id).call();
          const historyTold = await histories.methods.uriAdded(coinbase,id).call();
          if(balance > 0 && !historyTold){
            setIsOwner(true);
          }
        }
        histories.events.UriAdded({
          filter:{
            tokenId: id
          },
          fromBlock: 'latest'
        },async(err,res) => {
          const string = await (await fetch(`https://ipfs.io/ipfs/${res.returnValues.uri}`)).text()
          const newUris = [...uris,string];
          setUris(newUris);
        });
      } catch(err){
        console.log(err)
        if(!metadata){
          setErr(true);
        }
      }
    }
  },[uris,metadata,histories,id,hashavatars,coinbase]);

  return(
    <Split
      primary={
        <>
        {
          err &&
          <Info title="Wrong token ID" mode="warning">
            <p>Please select other token ID</p>
          </Info>
        }
        {
          (!metadata || !creator || !id) &&
          <SyncIndicator/>

        }
        {
          isOwner && histories &&
          <div>
          <Bar primary={<p>You can write {metadata.name}'s history</p>} secondary={<Button mode="strong" onClick={() => setOpened(true)}>Write history</Button>} />
          <Modal visible={opened} onClose={() => setOpened(false)}>
            <h4>Informations</h4>
            <p><small>To write a HashAvatar history you must have it in your wallet;</small></p>
            <p><small>The cost to write it is 0.1 xdai or 0.01 COLD, you can buy COLD at;</small></p>
            <p><small>New owners of this same token id can continue its history;</small></p>
            <p><small>Ready? Let us know {metadata.name}'s history!</small></p>
            <div><textarea rows="5" cols="40" onChange={handleOnChange} onKeyUp={handleOnChange} id="history"></textarea></div>
            {
              text && <div><Button mode="strong" size="small" onClick={() => addUri(0)}>Add history</Button></div>
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
          <center>
            <img src={metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
          </center>
          <h5>Creator</h5>
          {
            creator &&
            <div>
              <div>
              <IdentityBadge
                label={creator.profile?.name}
                entity={creator.address}
                networkType={netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={creator.profile?.name }
              />
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
                <p><Link href={creator.profile?.url} external={true}>{creator.profile?.url} <IconLink  /></Link></p>
              }
              <div style={{paddingTop:"60px"}}>
              <BackButton as={RouterLink} to={"/all-avatars"} style={{textDecoration: "none"}} />
              </div>
            </div>
          }
        </div>

      }
    />

  )
}

export default HashHistories;
