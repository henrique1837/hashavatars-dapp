import React,{useState} from "react";
import { Container,Row,Col,Image,Popover,OverlayTrigger,Spinner } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Pagination,Split,Button,EthIdenticon } from '@aragon/ui'
import LazyLoad from 'react-lazyload';

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
              filtered &&
              <center>
                {
                  state.creators.map(str => {
                    const obj = JSON.parse(str);
                    if(obj.address === filtered){
                      return(
                        <div>
                          <div>
                          <IdentityBadge
                            label={obj.profile?.name}
                            entity={obj.address}
                            networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                            popoverTitle={obj.profile?.name }
                          />
                          </div>
                          {
                            obj.profile?.image &&
                            <div>
                              <Image
                                rounded
                                src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                                style={{width: '250px',heigth: "250px"}}
                              />
                            </div>
                          }
                          <p>{obj.profile?.description}</p>
                          {
                            obj.profile?.url &&
                            <p><Link href={obj.profile?.url} external={true}>{obj.profile?.url} <IconLink  /></Link></p>
                          }
                        </div>
                      )
                    }
                  })
                }
              </center>
            }
            {
              state.loadingNFTs ?
              <center>
              <Spinner animation="border" size="2xl"/>
              <p>Loading ...</p>
              </center> :
              state.nfts?.length > 0 &&
              <>
              <Row>
              {
                state.nfts?.map(str => {
                  const obj = JSON.parse(str);

                  if(filtered){
                    if(filtered !== obj.creator){
                      return
                    }
                  }

                  const popover =
                    <Popover id={`popover-${obj.returnValues._id}`}>
                      <Popover.Header as="h3">{obj.metadata.name}</Popover.Header>
                      <Popover.Body>
                        <p>ID: {obj.returnValues._id}</p>
                        <p>Creator: {
                          <Link href="" onClick={() => setFiltered(obj.creator)}>
                            <IdentityBadge
                              label={obj.profile?.name}
                              badgeOnly
                              entity={obj.creator}
                              networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                              icon={obj.profile?.image ?
                                    <Image src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                                    <EthIdenticon address={obj.creator}/>
                              }
                            />
                          </Link>
                        }
                        </p>
                      {
                        obj.profile?.url &&
                        <p><small><Link href={obj.profile?.url} external={true}>{obj.profile?.url} <IconLink  /></Link></small></p>

                      }
                      <p><small><Link href={`https://epor.io/tokens/${state.hashavatars.options.address}/${obj.returnValues._id}`} external={true}>View on Epor.io{' '}<IconLink  /></Link></small></p>
                      <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${state.hashavatars.options.address}&id=${obj.returnValues._id}`} external={true}>View on Unifty.io{' '}<IconLink /></Link></small></p>
                      </Popover.Body>
                    </Popover>
                  return(
                    <Col style={{paddingTop:'80px'}}>

                    <LazyLoad>
                    <OverlayTrigger trigger="click" placement="top" overlay={popover}>
                      <center>
                        <div>
                          <p>{obj.metadata.name}</p>
                        </div>
                        <div>
                          <Image src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
                        </div>
                      </center>
                    </OverlayTrigger>
                    </LazyLoad>
                    </Col>
                  )
                })
              }
              </Row>
              {
                filtered &&
                <center>
                  <Button onClick={() => {setFiltered(null)}}>All Avatars</Button>
                </center>
              }
              </>
            }
            </>
          }
          secondary={

              !state.loadingNFTs &&
              <>
              <h4>Creators</h4>
              <p><small>Total of {state.creators.length} HashAvatars creators</small></p>
              <div>
              {
                state.creators?.map((string) => {
                  const obj = JSON.parse(string);
                  if(state.loadingNFTs){
                    return;
                  }
                  return(
                    <div>
                    <Link href="" onClick={() => setFiltered(obj.address)}>

                      <IdentityBadge
                        label={obj.profile?.name && obj.profile.name}
                        entity={obj.address}
                        badgeOnly
                        networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                        icon={obj.profile?.image ?
                              <Image src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                              <EthIdenticon address={obj.address}/>
                        }
                      />
                    </Link>

                    </div>
                  )
                })
              }
              </div>
              </>


          }
        />
        <Row>

        {
          /*
          !state.loadingNFTs &&
          <Pagination pages={Number(((nfts.length)/10).toFixed(0))} selected={selected} onChange={setSelected} />
          */
        }
        </Row>
      </Container>
    </>
  )
}

export default AllAvatars;
