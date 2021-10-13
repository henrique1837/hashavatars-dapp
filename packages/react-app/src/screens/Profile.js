import React from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Split,ProgressBar,SyncIndicator } from '@aragon/ui'
import { Link as RouterLink } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'
import useWeb3Modal from '../hooks/useWeb3Modal';

function Profile(){
  const { state } = useAppContext();
  const {profile} = useWeb3Modal();
  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>Profile</h4>
            {
              state.myOwnedNfts &&
              <p><small>Total of {state.myOwnedNfts.length} HashAvatars owned by you</small></p>

            }

            {
              state.loadingNFTs && state.nfts && state.totalSupply &&
              <center>
              <p>Loading all HashAvatars ...</p>
              <ProgressBar
                value={state.nfts.length/state.totalSupply}
              />
              </center>
            }
            {
              state.myOwnedNfts?.length > 0 &&
              <>
              <Row style={{textAlign: 'center'}}>
              {
                state.myOwnedNfts?.map(str => {
                  const obj = JSON.parse(str);

                  return(
                    <Col style={{paddingTop:'80px'}}>
                    <RouterLink to={`/tokens/${obj.returnValues._id}`} style={{textDecoration: "none"}}>

                      <center>
                        <div>
                          <p><b>{obj.metadata.name}</b></p>
                        </div>
                        <div>
                            <Image src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
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
            </>
          }
          secondary={

            <div>
              <div>
              <IdentityBadge
                label={profile?.name}
                entity={state.coinbase}
                connectedAccount
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={profile?.name }
              />
              </div>
              {
                profile?.image &&
                <div>
                  <Image
                    rounded
                    src={profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                    style={{width: '250px',heigth: "250px"}}
                  />
                </div>
              }
              <p>{profile?.description}</p>
              {
                profile?.url &&
                <p><Link href={state.profile?.url} external={true}>{profile?.url} <IconLink  /></Link></p>
              }
              <p><small>Created a total of {state.myNfts?.length} HashAvatars</small></p>
              <p><small>Owns a total of {state.myOwnedNfts?.length} HashAvatars</small></p>
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

export default Profile;
