import React,{useMemo,useState,useCallback} from "react";
import ReactDOMServer from 'react-dom/server';

import { Container,Row,Col,Spinner } from 'react-bootstrap';
import { Button,TextInput,TransactionBadge,ProgressBar,IconLink,SyncIndicator,LoadingRing } from '@aragon/ui';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from 'avataaars';
import IPFS from 'ipfs-http-client-lite';

import { useAppContext } from '../hooks/useAppState'
import useWeb3Modal from "../hooks/useWeb3Modal";
import useContract from "../hooks/useContract";

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})
function Mint(){
  const {loadWeb3Modal,coinbase,connecting} = useWeb3Modal();
  const {getMetadata,getTotalSupply} = useContract();
  const { state } = useAppContext();

  const [avatar,setAvatar] = useState();
  const [minting,setMinting] = useState(false);
  const [canMint,setCanMint] = useState(true);
  const [focused,setFocused] = useState(false);

  const [mintingMsg,setMintingMsg] = useState(false);
  const [pendingTx,setPendingTx] = useState(false);

  const [svg,setSVG] = useState();

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
      mouth: ["Concerned", "Default", "Disbelief", "Eating", "Sad", "ScreamOpen", "Serious", "Smile", "Twinkle"],
      skin: ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown"]
  }
  const randomize = useCallback(() => {
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
        mouthType: "Default",
        skinColor: avatarsVar.skin[Math.floor(Math.random() * avatarsVar.skin.length)],
      });
  },[avatarsVar])

  const mint = useCallback(async () => {
    try{
      setMinting(true);
      if(avatar.name.replace(/ /g, '') === "" || !avatar.name){
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Checking all tokens already minted ... </small></p>);

      const promises = [];
      const totalSupply = await getTotalSupply();
      for(let i = 1; i <= totalSupply; i++){
        promises.push(getMetadata(i,state.hashavatars))
      }

      const metadatas = await Promise.allSettled(promises);
      let cont = true;

      metadatas.map(obj => {
        //const obj = JSON.parse(string);
        if(obj.name === avatar.name) {
          cont = false
        }
      });
      if(!cont){
        alert("HashAvatar with that name already claimed");
        setMintingMsg(null);
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Storing image and metadata at IPFS ... </small></p>);
      const imgres = await ipfs.add(svg);
      const id = Number(await state.hashavatars.methods.totalSupply().call()) + 1;
      console.log(id)
      let metadata = {
          name: avatar.name,
          image: `ipfs://${imgres[0].hash}`,
          external_url: `https://thehashavatars.com/#/tokens/${id}`,
          description: "Generate and mint your own avatar as ERC1155 NFT",
          attributes: [
            {
              trait_type: "Top Type",
              value: avatar.topType
            },
            {
              trait_type: "Acessories Type",
              value: avatar.accessoriesType
            },
            {
              trait_type: "Hair Color",
              value: avatar.hairColor
            },
            {
                trait_type: "Facial Hair Type",
                value: avatar.facialHairType
            },
            {
                trait_type: "Facial Hair Color",
                value: avatar.facialHairColor
            },
            {
                trait_type: "Clothe Type",
                value: avatar.clotheType
            },
            {
                trait_type: "Clothe Color",
                value: avatar.clotheColor
            },
            {
                trait_type: "Eye Type",
                value: avatar.eyeType
            },
            {
                trait_type: "Eyebrow Type",
                value: avatar.eyebrowType
            },
            {
                trait_type: "Mounth Type",
                value: avatar.mounthType
            },
            {
                trait_type: "Skin Color",
                value: avatar.skinColor
            },
            {
                trait_type: "DNA",
                value: avatar.dna
            },
          ]
      }
      const res = await ipfs.add(JSON.stringify(metadata));
      const uri = res[0].hash;
      console.log(uri)
      setMintingMsg(<p><small>Approve transaction ... </small></p>);
      const fees = [{
        recipient: state.coinbase,
        value: 500
      }];

      await state.hashavatars.methods.mint(id,fees,1,uri).send({
        from: state.coinbase,
        value: 10 ** 18,
        gasPrice: 1000000000
      }).once('transactionHash',(hash) => {
        setMintingMsg(
          <div>
           Tx sent <TransactionBadge transaction={hash} networkType={state.netId === 4 ? "rinkeby" : "xdai"} />
          </div>
        )
        /*
        this.setState({
          mintingMsg: <p><small>Transaction <Link href={`https://blockscout.com/xdai/mainnet/tx/${hash}`} isExternal >{hash}</Link> sent, wait confirmation ...</small></p>
        });
        */
      });
      setMintingMsg(<p><small>Transaction confirmed!</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null)
      },5000)

    } catch(err){
      setMintingMsg(<p><small>{err.message}</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null);
      },2000)
    }
  },[state,avatar,svg,getMetadata,getTotalSupply,state.hashavatars]);


  const handleOnChange = async (e) => {
        e.preventDefault();
        try{
          const web3 = state.provider;
          const dna = web3.utils.toBN(web3.utils.toHex(web3.utils.sha3(e.target.value.trim()))).toString();

          let topIndex = (Number(dna.substring(0,2)) % 35 + 1).toFixed(0);
          if(topIndex > avatarsVar.top.length - 1){
            topIndex = topIndex - (avatarsVar.top.length - 1)*(topIndex/(avatarsVar.top.length - 1));
          }
          let accessoriesIndex = (Number(dna.substring(2,3)) % 6 + 1).toFixed(0);
          if(accessoriesIndex > avatarsVar.accessories.length - 1){
            accessoriesIndex = accessoriesIndex - (avatarsVar.accessories.length - 1)*(accessoriesIndex/(avatarsVar.accessories.length - 1));
          }
          let hairColorIndex = (Number(dna.substring(4,5)) % 9 + 1).toFixed(0);
          if(hairColorIndex > avatarsVar.hairColor.length - 1){
            hairColorIndex = hairColorIndex - (avatarsVar.hairColor.length - 1)*(hairColorIndex/(avatarsVar.hairColor.length - 1));
          }
          let facialHairIndex = (Number(dna.substring(6,7)) % 6 + 1).toFixed(0);
          if(facialHairIndex > avatarsVar.facialHair.length - 1){
            facialHairIndex = facialHairIndex - (avatarsVar.facialHair.length - 1)*(facialHairIndex/(avatarsVar.facialHair.length - 1));
          }
          let facialHairColorIndex = (Number(dna.substring(8,9)) % 7 + 1).toFixed(0);
          if(facialHairColorIndex > avatarsVar.facialHairColor.length - 1){
            facialHairColorIndex = facialHairColorIndex - (avatarsVar.facialHairColor.length - 1)*(facialHairColorIndex/(avatarsVar.facialHairColor.length - 1));
          }
          let clotheIndex = (Number(dna.substring(10,11)) % 8 + 1).toFixed(0);
          if(clotheIndex > avatarsVar.clothes.length - 1){
            clotheIndex = clotheIndex - (avatarsVar.clothes.length - 1)*(clotheIndex/(avatarsVar.clothes.length - 1));
          }
          let clotheColorIndex = (Number(dna.substring(12,14)) % 14 + 1).toFixed(0);
          if(clotheColorIndex > avatarsVar.clothesColor.length - 1){
            clotheColorIndex = clotheColorIndex - (avatarsVar.clothesColor.length - 1)*(clotheColorIndex/(avatarsVar.clothesColor.length - 1));
          }
          let eyeTypeIndex = (Number(dna.substring(14,16)) % 14 + 1).toFixed(0);
          if(eyeTypeIndex > avatarsVar.eye.length - 1){
            eyeTypeIndex = eyeTypeIndex - (avatarsVar.eye.length - 1)*(eyeTypeIndex/(avatarsVar.eye.length - 1));
          }
          let eyebrowIndex = (Number(dna.substring(16,18)) % 11 + 1).toFixed(0);
          if(eyebrowIndex > avatarsVar.eyebrown.length - 1){
            eyebrowIndex = eyebrowIndex - (avatarsVar.eyebrown.length - 1)*(eyebrowIndex/(avatarsVar.eyebrown.length - 1));
          }
          let mounthTypeIndex = (Number(dna.substring(18,20)) % 11 + 1).toFixed(0);
          if(mounthTypeIndex > avatarsVar.mouth.length - 1){
            mounthTypeIndex = mounthTypeIndex - (avatarsVar.mouth.length - 1)*(mounthTypeIndex/(avatarsVar.mouth.length - 1));
          }
          let skinTypeIndex = (Number(dna.substring(20,21)) % 6 + 1).toFixed(0);
          if(skinTypeIndex > avatarsVar.skin.length - 1){
            skinTypeIndex = skinTypeIndex - (avatarsVar.skin.length - 1)*(skinTypeIndex/(avatarsVar.skin.length - 1));
          }
          const av = {
            avatarStyle: 'Circle',
            topType: avatarsVar.top[topIndex],
            accessoriesType: avatarsVar.accessories[accessoriesIndex],
            hairColor: avatarsVar.hairColor[hairColorIndex],
            facialHairType: avatarsVar.facialHair[facialHairIndex],
            facialHairColor:  avatarsVar.facialHairColor[facialHairColorIndex],
            clotheType: avatarsVar.clothes[clotheIndex],
            clotheColor : avatarsVar.clothesColor[clotheColorIndex],
            eyeType: avatarsVar.eye[eyeTypeIndex],
            eyebrowType: avatarsVar.eyebrown[eyebrowIndex],
            mouthType: avatarsVar.mouth[mounthTypeIndex],
            skinColor: avatarsVar.skin[skinTypeIndex],
            name: e.target.value.trim(),
            dna: dna
          };
          let metadatas;
          /*
          if(state.loadingNFTs && state.hashavatars){
            const promises =[];
            const totalSupply = await getTotalSupply();
            for(let i = 1; i <= totalSupply; i++){
              promises.push(getMetadata(i,state.hashavatars))
            }
            metadatas = await Promise.allSettled(promises);
            alert(metadatas.length)
            metadatas = metadatas.map(obj => {
              return(JSON.stringify(obj))
            })
          } else {

          }
          */
          metadatas = state.nfts.map(str => {
            const obj = JSON.parse(str);
            return(obj.metadata);
          });
          let cont = true;

          metadatas.map(obj => {
            //const obj = JSON.parse(string);
            if(obj.name === av.name) {
              cont = false
              const svg = <img src={obj.image.replace("ipfs://","https://ipfs.io/ipfs/")}  /> ;
              setSVG(svg);
              setAvatar(null);
            }
            return(obj)
          });
          if(!cont){
            setCanMint(false);
            return;
          }
          setAvatar(av);
          const svg = ReactDOMServer.renderToString(<Avatar {...av} />);
          setCanMint(true);
          setSVG(svg);

      } catch(err){
        console.log(err)
      }

  }



  useMemo(() => {
    if(!avatar && !svg){
      randomize();
    }
    if(document.getElementById("input_name") && !focused){
      setFocused(true);
      document.getElementById("input_name").focus();
      document.getElementById("input_name").select();
    }
  },[avatar,randomize,svg,focused,document.getElementById("input_name")])

  return(
    <>
      <Container>
        <center>
            <p>The <b>HashAvatars</b> are Avatars waiting to be claimed by anyone on xDai Chain.</p>
            <p>Once you select the avatar's name a specific avatar figure will be generated and you can mint it.</p>
            <p>Choose your preferred HashAvatar and start your collection now!</p>
        </center>
        <center>
          {
            avatar ?
            <Avatar {...avatar} /> :
            svg
          }
        </center>
        <center style={{marginBottom: '10px',marginTop: '10px'}}>
          <TextInput placeholder="Avatar's Name"
                     onChange={handleOnChange}
                     id="input_name"
          />
        </center>
        <center>
        {
          (
            state.coinbase ?
            (
                !minting && !pendingTx ?
                (
                  state.hashavatars && !connecting ?
                  (
                    canMint ?
                    <Button onClick={mint}>Claim</Button> :
                    <p>HashAvatar with that name already claimed</p>
                  ) :
                  <p><LoadingRing/><small>Loading smart contract</small></p>
                ) :
                (
                  <div style={{wordBreak: 'break-word'}}>
                    <Spinner animation="border" size="2xl"/>
                    {mintingMsg}
                  </div>
                )

            ) :
            !coinbase && window.ethereum ?
            state.hashavatars && <Button onClick={loadWeb3Modal}>Connect Wallet</Button> :
            !window.ethereum && <Button onClick={() => {window.open("https://metamask.io/", '_blank')}}>Install Metamask <IconLink/></Button>


          )
        }
        </center>
        {
          state.coinbase &&
          state.loadingNFTs &&
          state.nfts &&
          state.totalSupply &&
          <center>
          <p>Loading all HashAvatars ...</p>
          <ProgressBar
            value={state.nfts?.length/state.totalSupply}
          />
          </center>
        }
        {
          state.myNfts.length > 0 &&
          <>
          <h4>HashAvatars created by you</h4>
          <Row style={{textAlign: 'center'}}>
          {
            state.myNfts?.map(str => {
              const obj = JSON.parse(str);
              return(
                <Col style={{paddingTop:'80px'}}>
                <RouterLink to={`/tokens/${obj.returnValues._id}`} style={{textDecoration: "none"}}>

                  <center>
                    <div>
                      <p>{obj.metadata.name}</p>
                    </div>
                    <div>
                      <img src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
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
        {
          state.loadingNFTs &&
          <SyncIndicator />
        }
      </Container>
    </>
  )
}

export default Mint;
