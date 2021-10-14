import React,{useMemo,useState} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Split,LoadingRing,SyncIndicator,BackButton } from '@aragon/ui';
import { Link as RouterLink } from 'react-router-dom';
import { useParams } from "react-router-dom";

import useProfile from '../hooks/useProfile';
import useContract from "../hooks/useContract";
import useWeb3Modal from "../hooks/useWeb3Modal";

function UserProfile(){
  const {hashavatars} = useContract();
  const {getProfile} = useProfile();
  const {netId} = useWeb3Modal();
  const [loadingNFTs,setLoadingNFTs] = useState(true);

  const [checking,setChecking] = useState(false);

  const {address} = useParams();

  const [ownedNfts,setownedNfts] = useState([]);
  const [createdNfts,setCreatedNfts] = useState([]);
  const ids = [];

  const [profile,setProfile] = useState();

  useMemo(async() => {

    if(!profile && hashavatars && address && !checking){
      try{
        setChecking(true);
        const newProfile = await getProfile(address);
        setProfile(newProfile);

        const events = await hashavatars.getPastEvents('URI',{
          filter:{},
          fromBlock: 0
        });
        const promises = [];
        for(const res of events){
          promises.push(
            new Promise(async (reject,resolve) => {
              try{
                const id = res.returnValues._id;
                if(ids.includes(id)){
                  resolve("ok")
                }
                ids.push(id);
                const balance = await hashavatars.methods.balanceOf(address,id).call();
                const creator = await hashavatars.methods.creators(id).call();
                const uriToken = await hashavatars.methods.uri(id).call();

                if(uriToken.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT") || uriToken === "ipfs://" || uriToken === "" || !uriToken ){
                  resolve("ok")
                }
                const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
                fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));
                const obj = {
                  returnValues: res.returnValues,
                  metadata: metadataToken
                }
                if(creator.toLowerCase() === address.toLowerCase()){
                  if(createdNfts.includes(obj)){
                    resolve("Included");
                  }
                  const newCreatedNfts = createdNfts;
                  newCreatedNfts.unshift(obj);
                  setCreatedNfts(newCreatedNfts);
                }
                if(balance > 0){
                  if(ownedNfts.includes(obj)){
                    resolve("Included");
                  }
                  const newOwnedNfts = ownedNfts;
                  newOwnedNfts.unshift(obj);
                  setownedNfts(newOwnedNfts);
                }

                resolve(obj)
              } catch(err){
                reject(err);
              }
            })
          )
        }

        await Promise.allSettled(promises)
        setLoadingNFTs(false);
      } catch(err){
        console.log(err)
      }
    }
  },[profile,ownedNfts,hashavatars,address,getProfile]);

  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>HashAvatars owned</h4>
            <Row style={{textAlign: 'center'}}>
            {
              ownedNfts?.map(obj => {

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
          secondary={

            <div>
              <div>
              <IdentityBadge
                label={profile?.name}
                entity={address}
                networkType={netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={profile?.name }
                popoverAction={{label:"View Profile",onClick: () => {window.open(`https://self.id/${address}`,"_blank")}}}

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
          loadingNFTs &&
          <SyncIndicator />
        }
      </Container>
    </>
  )
}

export default UserProfile;
