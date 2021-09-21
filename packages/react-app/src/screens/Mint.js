import React,{useMemo,useState} from "react";
import { Container,Row,Col,Image,Popover,OverlayTrigger,Spinner } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Button } from '@aragon/ui'
import LazyLoad from 'react-lazyload';

import { useAppContext } from '../hooks/useAppState'


function Mint(){

  const { state } = useAppContext();

  const [avatar,setAvatar] = useState();
  const avatarsVar = {
      top: ["NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1", "WinterHat2", "WinterHat3", "WinterHat4", "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", "LongHairDreads", "LongHairFrida", "LongHairFro", "LongHairFroBand", "LongHairNotTooLong", "LongHairShavedSides", "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand", "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", "ShortHairShaggyMullet", "ShortHairShortCurly", "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShortWaved", "ShortHairSides", "ShortHairTheCaesar"],
      accessories: ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses"],
      hairColor: ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Platinum", "Red"],
      facialHair: ["Blank", "BeardMedium","Blank", "BeardLight", "BeardMajestic", "MoustacheFancy"],
      facialHairColor: ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "Platinum"],
      clothes: ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck"],
      clothesColor: ["Black", "Blue01", "Blue02", "Blue03", "Gray01", "Gray02", "Heather", "PastelBlue", "PastelGreen", "PastelOrange", "PastelRed", "PastelYellow", "Pink", "Red"],
      eye: ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink"],
      eyebrown: ["Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", "RaisedExcitedNatural", "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown"],
      mouth: ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle"],
      skin: ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown"]
  }
  const randomize = () => {
      setAvatar({
        avatarStyle: 'Circle',
        topType: avatarsVar.top[Math.floor(Math.random() * avatarsVar.top.length)],
        accessoriesType: avatarsVar.accessories[Math.floor(Math.random() * avatarsVar.accessories.length)],
        hairColor: avatarsVar.hairColor[Math.floor(Math.random() * avatarsVar.hairColor.length)],
        facialHairType: avatarsVar.facialHair[Math.floor(Math.random() * avatarsVar.facialHair.length)],
        facialHairColor:  avatarsVar.facialHairColor[Math.floor(Math.random() * avatarsVar.facialHairColor.length)],
        clotheType: avatarsVar.clothes[Math.floor(Math.random() * avatarsVar.clothes.length)],
        clotheColor : avatarsVar.clothesColor[Math.floor(Math.random() * avatarsVar.clothesColor.length)],
        eyeType: avatarsVar.eye[Math.floor(Math.random() * avatarsVar.eye.length)],
        eyebrowType: avatarsVar.eyebrown[Math.floor(Math.random() * avatarsVar.eyebrown.length)],
        mounthType: avatarsVar.mouth[Math.floor(Math.random() * avatarsVar.mouth.length)],
        skinColor: avatarsVar.skin[Math.floor(Math.random() * avatarsVar.skin.length)],
      });
  }

  const mint = async () => {

  }


  useMemo(() => {
    if(!avatar){
      randomize();
    }
  },[avatar,randomize])

  return(
    <>

      <Container>
        <center>
            <p>The <b>HashAvatars</b> are Avatars waiting to be claimed by anyone on xDai Chain.</p>
            <p>Once you select the avatar's name a specific avatar figure will be generated and you can mint it.</p>
            <p>Choose your preferred HashAvatar and start your collection now!</p>
        </center>
        <h4>HashAvatars created by you</h4>
        {
          state.loadingNFTs ?
          <center>
          <Spinner animation="border" size="2xl"/>
          <p>Loading ...</p>
          </center> :
          state.myNfts?.length > 0 &&
          <>
          <Row>
          {
            state.myNfts?.map(str => {
              const obj = JSON.parse(str);


              const popover =
                <Popover id={`popover-${obj.returnValues._id}`}>
                  <Popover.Header as="h3">{obj.metadata.name}</Popover.Header>
                  <Popover.Body>
                    <p>ID: {obj.returnValues._id}</p>
                    <p>Creator: {
                      obj.profile?.image ?
                      <>
                      <Image
                        rounded
                        src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                        width={'25px'}
                      />
                      {' '}
                      {obj.profile.name}
                      </> :
                      <IdentityBadge
                        label={obj.profile?.name}
                        entity={obj.creator}
                        networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                        popoverTitle={obj.profile?.name }
                        connectedAccount
                      />
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
          </>
        }
      </Container>
    </>
  )
}

export default Mint;
