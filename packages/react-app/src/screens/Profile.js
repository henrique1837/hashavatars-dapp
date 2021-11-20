import React,{useState} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Split,ProgressBar,SyncIndicator,TokenAmount,Info,Button } from '@aragon/ui'
import { Link as RouterLink } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'
//import useERC20 from "../hooks/useERC20";
//import useERC20Rewards from "../hooks/useERC20Rewards";

function Profile(){
  const { state } = useAppContext();
  //const {rewards,claimRewards,haveRewards} = useERC20Rewards();

  //const {coldBalance,hashBalance} = useERC20();

  //const [claiming,setClaiming] = useState(false);


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
                    <Col style={{
                      paddingTop:'80px',
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap"
                    }}
                    md={4}
                    >
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

            <div style={{wordBreak: 'break-word'}}>
              <div>
              <IdentityBadge
                label={state.profile?.name}
                entity={state.coinbase}
                connectedAccount
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={state.profile?.name }
                popoverAction={{label:"Edit Profile",onClick: () => {window.open(`https://self.id/${state.coinbase}`,"_blank")}}}
              />
              </div>
              {
                state.profile?.image &&
                <div>
                  <Image
                    rounded
                    src={state.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                    style={{width: '250px',heigth: "250px"}}
                  />
                </div>
              }
              <p>{state.profile?.description}</p>
              {
                state.profile?.url &&
                <p><Link href={state.profile?.url} external={true}>{state.profile?.url} <IconLink  /></Link></p>
              }
              <p><small>Created a total of {state.myNfts?.length} HashAvatars</small></p>
              <p><small>Owns a total of {state.myOwnedNfts?.length} HashAvatars</small></p>
              {
                /*
                (coldBalance || hashBalance) &&
                <p>Balances:</p>
                */
              }
              <div>
              {
                /*
                coldBalance &&
                <TokenAmount
                  address={state.coinbase}
                  amount={coldBalance}
                  decimals={18}
                  iconUrl={'https://ipfs.io/ipfs/bafkreihncs32gbqx42cgwoqxouk6lv6ytdufddhgfajpersoxirvijjtei'}
                  symbol={"COLD"}
                />
                */
              }
              </div>
              <div>
              {
                /*
                hashBalance &&
                <TokenAmount
                  address={state.coinbase}
                  amount={hashBalance}
                  decimals={18}
                  iconUrl={'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'}
                  symbol={"Hash"}
                />
              }
              {
                haveRewards && rewards && claimRewards && !claiming && state.netId === 4 &&
                <Info title="Hash Governance" mode="info" style={{paddingTop: '25px'}}>
                  <p>You have some Hash to claim!</p>
                  <p><small>Read about Hash Token, the Governance Token of HashAvatars at ...</small></p>
                  <center><Button onClick={async () => {
                    try{
                      setClaiming(true);
                      await claimRewards();
                      setClaiming(false);
                    } catch(err){
                      console.log(err);
                      setClaiming(false);
                    }
                  }} mode="strong">Claim</Button></center>
                </Info>
                */
              }
              </div>
            </div>

          }
        />

        {
          state.loadingNFTs &&
          //|| ((!coldBalance || !hashBalance || !rewards) && state.coinbase && state.netId === 4)) &&
          <SyncIndicator />
        }
      </Container>
    </>
  )
}

export default Profile;
