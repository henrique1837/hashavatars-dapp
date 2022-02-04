import React,{useState,useMemo,useEffect} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import {
  IdentityBadge,
  LoadingRing
} from '@aragon/ui';
import { Link } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState';
import useGraphClient from '../hooks/useGraphClient';


function Activities(){
  const { state } = useAppContext();
  const {client} = useGraphClient();
  const [stories,setStories] = useState([]);
  const [previousNetId,setPreviousNetId] = useState();

  const [loadingStories,setLoadingStories] = useState(true);
  const [getingData,setGetingData] = useState(false);

  useEffect(() => {
    if(state.netId !== previousNetId){
      setStories([]);
      setGetingData(false);
      setLoadingStories(true);
      setPreviousNetId(state.netId)
    }
  },[state.netId,previousNetId])

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
    if(state.ipfs && stories && !loadingStories){
      stories.map(obj => {
        state.ipfs.pin.add(obj.story.uri);
      })
    }
  },[state.ipfs,stories,loadingStories]);

  return(
    <>
      <h2>Activities</h2>
      <small>Check it out latest activities in HashAvatars dapp!</small>
      <h4>Stories</h4>
      <Container>
      {
       stories?.map(obj => {
         return(
           <Row style={{paddingTop: '50px',height: "300px",textOverflow:"ellipsis",overflow:"hidden"}}>
             <Col style={{wordBreak:'break-word'}} md={9} fontSize="md">
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
             <Col style={{wordBreak:'break-all',textAlign:"center"}} md={3} fontSize="md">
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
