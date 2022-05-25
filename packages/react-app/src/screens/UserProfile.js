import React,{useMemo,useState} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Split,LoadingRing,SyncIndicator,BackButton } from '@aragon/ui';
import { Link as RouterLink } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { gql } from '@apollo/client';

import { useAppContext } from '../hooks/useAppState';


import useProfile from '../hooks/useProfile';






function UserProfile(){
  const { state } = useAppContext();

  const {getProfile} = useProfile();
  const {address} = useParams();
  const [checking,setChecking] = useState(false);
  const [ownedNfts,setOwnedNfts] = useState([]);
  const [createdNfts,setCreatedNfts] = useState([]);
  const [profile,setProfile] = useState();

  useMemo(async () => {
    if(!state.hashavatars){
      setOwnedNfts([])
      setChecking(false)
      setCreatedNfts([]);
    }
  },[state.hashavatars])
  useMemo(async () => {
    const newProfile = await getProfile(address);
    setProfile(newProfile);
  },[profile,address]);

  useMemo(async () => {
    if(state.client && !checking && address){
      setChecking(true);
      const tokensQuery = `
        query {
              users(where: {
                id: "${address}"
              }) {
                id
                tokens {
                  id
                  tokenID,
                  metadataURI,
                  createdAtTimestamp
                }
                created {
                  id
                  tokenID,
                  metadataURI,
                  createdAtTimestamp
                }
              }
            }
      `
      const results = await state.client.query({
        query: gql(tokensQuery)
      });
      const objs = results.data.users[0].created;
      const objsOwned = results.data.users[0].tokens;

      setCreatedNfts(objs);
      setOwnedNfts(objsOwned);
    }

  },[state.client,address]);


  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>HashAvatars Created</h4>
            <Row style={{textAlign: 'center'}}>
            {
              state.nfts?.map(string => {
                const obj = JSON.parse(string);
                if(obj.creator.toLowerCase() !== address.toLowerCase()){
                  return;
                }
                return(
                  <Col style={{
                    paddingTop:'80px',
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                  md={4}>
                  <RouterLink to={`/tokens/${obj.returnValues._id}`} style={{textDecoration: "none"}}>

                    <center>
                      <div style={{maxWidth:"200px"}}>
                        <p><b>{obj.metadata.name}</b></p>
                      </div>
                      <div>
                          <img src={obj.metadata?.image.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} width="150px"/>
                      </div>
                    </center>
                    </RouterLink>

                  </Col>
                )
              })
            }
            </Row>
            </>
          }
          secondary={

            <div>
              <div>
              <IdentityBadge
                label={profile?.name}
                entity={address}
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={profile?.name }
                popoverAction={{label:"View Profile",onClick: () => {window.open(`https://self.id/${address}`,"_blank")}}}

              />
              </div>
              {
                profile?.image &&
                <div>
                  <img
                    src={profile.image.original.src.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])}
                    style={{width: '250px',heigth: "250px"}}
                  />
                </div>
              }
              <p>{profile?.description}</p>
              {
                profile?.url &&
                <p><Link href={profile?.url} external={true}>{profile?.url} <IconLink  /></Link></p>
              }
              <p><small>Created a total of {createdNfts?.length} HashAvatars</small></p>
              <p><small>Owns a total of {ownedNfts?.length} HashAvatars</small></p>
              <div style={{paddingTop:"60px"}}>
              <BackButton as={RouterLink} to={"/all-avatars"} style={{textDecoration: "none"}} />
              </div>
            </div>

          }
        />

        {
          state.loadingNFTs &&
          <SyncIndicator />
        }
      </Container>
    </>
  )
}

export default UserProfile;
