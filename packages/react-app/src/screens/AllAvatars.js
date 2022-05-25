import React,{useState} from "react";
import { Container,Row,Col,Spinner } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Pagination,Split,Button,EthIdenticon,ProgressBar } from '@aragon/ui'
import { Link as RouterLink } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'

function AllAvatars(){
  const { state } = useAppContext();
  const [selected, setSelected] = useState(0)
  const [filtered,setFiltered] = useState();

  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>All HashAvatars</h4>
            {
              state.totalSupply &&
              <p><small>Total of {state.totalSupply} HashAvatars</small></p>

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
              !filtered && state.totalSupply &&
              <Pagination pages={
                (Number((state.totalSupply/12).toFixed(0)) < Number((state.totalSupply/12))) ?
                  Number((state.totalSupply/12).toFixed(0)) + 1 :
                  Number((state.totalSupply/12).toFixed(0))
              } selected={selected} onChange={setSelected} />
            }
            {
              state.nfts?.length > 0 &&
              <>
              <Row style={{textAlign: 'center'}}>
              {
                state.nfts?.map(str => {
                  const obj = JSON.parse(str);

                  if(filtered){
                    if(filtered !== obj.creator){
                      return
                    }
                  }

                  if(!filtered &&
                      ((obj.returnValues._id <= state.totalSupply - (selected+1)*12) ||
                       (obj.returnValues._id > state.totalSupply - ((selected+1)*12) + 12))){
                    return
                  }

                  return(
                    <Col style={{
                      paddingTop:'80px',
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap"
                    }}
                    md={4}>


                    <RouterLink to={`/tokens/${obj.returnValues._id}`} style={{
                      textDecoration: "none"
                    }}>
                      <center>
                        <div style={{maxWidth:"200px"}}>
                          <p><b>{obj.metadata.name}</b></p>
                        </div>
                        <div>
                          <img src={obj.metadata.image.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} width="150px"/>
                        </div>
                      </center>
                    </RouterLink>

                    </Col>
                  )
                })
              }
              </Row>
                {
                  filtered &&
                  <center>
                    <Button onClick={() => {setFiltered(null);setSelected(0)}}>All Avatars</Button>
                  </center>
                }
                </>
            }
            </>
          }
          secondary={
              <div style={{maxHeight: "1000px",overflowY: "scroll"}}>
              <h4>Creators</h4>
              <p><small>Total of {!state.loadingNFTs ? state.creators?.length : <Spinner animation="border" size="sm"/>} HashAvatars creators</small></p>
              <div>
              {
                state.creators?.map((string) => {
                  const obj = JSON.parse(string);

                  return(
                    <div>
                    <RouterLink to={`/profiles/${obj.address}`} style={{textDecoration: "none"}}>

                      <IdentityBadge
                        label={obj.profile?.name && obj.profile.name}
                        entity={obj.address}
                        badgeOnly
                        networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                        icon={obj.profile?.image ?
                              <img src={obj.profile.image.original.src.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} style={{width: '25px'}} /> :
                              <EthIdenticon address={obj.address}/>
                        }
                      />
                    </RouterLink>

                    </div>
                  )
                })
              }
              </div>
              </div>


          }
        />

      </Container>
    </>
  )
}

export default AllAvatars;
