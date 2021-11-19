import React,{useState,useMemo,useEffect} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import {
  IdentityBadge,
  LoadingRing
} from '@aragon/ui';
import { Link } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'
import useIpfs from '../hooks/useIPFS';



const APIURL_RINKEBY = "https://api.studio.thegraph.com/query/6693/hashavatars-rinkeby/0.0.9";
const APIURL_XDAI = "https://api.studio.thegraph.com/query/6693/hashavatars-xdai/0.0.2";


function Activities(){
  const { state } = useAppContext();

  const {ipfs} = useIpfs();

  const [client,setClient] = useState();
  const [stories,setStories] = useState([]);
  const [previousNetId,setPreviousNetId] = useState();

  const [loadingStories,setLoadingStories] = useState(true);
  const [getingData,setGetingData] = useState(false);

  useEffect(() => {
    if(state.netId !== previousNetId){
      setClient();
      setStories([]);
      setGetingData(false);
      setLoadingStories(true);
      setPreviousNetId(state.netId)
    }
  },[state.netId,previousNetId])

  useMemo(async () => {
    if(!client && state.netId){
      let newClient;
      if(state.netId === 4){
        newClient = new ApolloClient({
          uri: APIURL_RINKEBY,
          cache: new InMemoryCache()
        });
      }
      if(state.netId === 0x64){
        newClient = new ApolloClient({
          uri: APIURL_XDAI,
          cache: new InMemoryCache()
        });
      }
      setClient(newClient);
    }
  },[client,state.netId]);

  useMemo(async () => {
    if(client && state.hashavatars && !getingData){
      setGetingData(true);
      const subquery = `
        {
          stories(first: 5,
            		  orderBy: createdAtTimestamp,
            			orderDirection:desc) {
            id
        		uri
            tokenID
            createdAtTimestamp
            creator {
              id
            }
          }
        }
      `

      const results = await client.query({
        query: gql(subquery)
      });
      const queryStories = results.data.stories;
      for(let story of queryStories){
        const text =  await (await fetch(`https://ipfs.io/ipfs/${story.uri}`)).text();
        const uriToken = await state.hashavatars.uri(Number(story.tokenID));
        const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
        const obj = {
          story: story,
          text: text,
          metadataToken: metadataToken
        }
        const newStories = stories;
        newStories.push(obj);
        setStories(newStories);
      }
      setLoadingStories(false);
    }
  },[stories,client,state.hashavatars,getingData]);

  useMemo(() => {
    if(ipfs && stories && !loadingStories){
      stories.map(story => {
        ipfs.pin.add(story.uri);
      })
    }
  },[ipfs,stories,loadingStories]);

  return(
    <>
      <h2>Activities</h2>
      <small>Check it out latest activities in HashAvatars dapp!</small>
      <h4>Stories</h4>
      <Container>
      {
       stories?.map(obj => {
         return(
           <Row style={{paddingTop: '50px'}}>
             <Col style={{wordBreak:'break-word',textOverflow:"ellipsis"}} fontSize="md">
             <div>
              <p><small>{(new Date(Number(obj.story.createdAtTimestamp)*1000)).toUTCString()}</small></p>
              <p>
              <Link to={`/profiles/${obj.story.creator.id}`} style={{textDecoration: "none"}}>
                <IdentityBadge
                  entity={obj.story.creator.id}
                  networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                  badgeOnly
                />
               </Link>
              </p>
             </div>
             <div style={{paddingTop:'25px'}}>{obj.text}</div>
             </Col>
             <Col style={{wordBreak:'break-word',textAlign:"center"}} fontSize="md">
               <Link to={`/tokens/${obj.story.tokenID}`} style={{textDecoration: "none"}}>
                <div>
                  <div>
                    <img src={obj.metadataToken?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="100px"/>
                  </div>
                  <p><small>{obj.metadataToken.name}</small></p>
                </div>
               </Link>
             </Col>
           </Row>
         )
       })
      }
      </Container>
      {
        loadingStories &&
        <div>
          <LoadingRing />
          <small>loading ...</small>
        </div>
      }
    </>
  )
}

export default Activities;
