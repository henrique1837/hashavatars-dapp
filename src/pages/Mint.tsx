import * as React from "react";
import ReactDOMServer from 'react-dom/server';
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Stack,
  Grid,
  Button,
  theme,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Divider,
  Link,
  Image,
  Center,
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'


import IPFS from 'ipfs-http-client-lite';
import Avatar from 'avataaars';


/*
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});
*/

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})


class MintPage extends React.Component {

  state = {
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
    skin: ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown"],
    savedBlobs: [],
    allHashAvatars: [],
  }
  constructor(props){
    super(props)
    this.randomize = this.randomize.bind(this);
    this.handleEvents = this.handleEvents.bind(this);
    this.mint = this.mint.bind(this);
    this.checkTokens = this.props.checkTokens;
  }
  componentDidMount = async () => {
    await this.props.initWeb3();

    this.randomize();
    const results = await this.props.checkTokens();
    for(let res of results){
      await this.handleEvents(null,res);
    }
    const itoken = this.props.itoken;
    itoken.events.TransferSingle({
      filter: {
      },
      fromBlock: 'latest'
    }, this.handleEvents);
  }

  randomize = async () => {

    this.setState({
      avatar: {
        avatarStyle: 'Circle',
        topType: this.state.top[Math.floor(Math.random() * this.state.top.length)],
        accessoriesType: this.state.accessories[Math.floor(Math.random() * this.state.accessories.length)],
        hairColor: this.state.hairColor[Math.floor(Math.random() * this.state.hairColor.length)],
        facialHairType: this.state.facialHair[Math.floor(Math.random() * this.state.facialHair.length)],
        facialHairColor:  this.state.facialHairColor[Math.floor(Math.random() * this.state.facialHairColor.length)],
        clotheType: this.state.clothes[Math.floor(Math.random() * this.state.clothes.length)],
        clotheColor : this.state.clothesColor[Math.floor(Math.random() * this.state.clothesColor.length)],
        eyeType: this.state.eye[Math.floor(Math.random() * this.state.eye.length)],
        eyebrowType: this.state.eyebrown[Math.floor(Math.random() * this.state.eyebrown.length)],
        mounthType: this.state.mouth[Math.floor(Math.random() * this.state.mouth.length)],
        skinColor: this.state.skin[Math.floor(Math.random() * this.state.skin.length)],
      }
    });



  }


  mint = async () => {

    try{
      if(this.state.avatar.name.replace(/ /g, '') === "" || !this.state.avatar.name){
        return;
      }
      let cont = true;
      let dnaNotUsed = true;
      this.state.allHashAvatars.map(string => {
        const obj = JSON.parse(string);
        if(obj.metadata.name === this.state.avatar.name) {
          cont = false
        }
        if(obj.metadata.dna === this.state.avatar.dna) {
          cont = false
        }
      });
      if(!cont){
        alert("HashAvatar with that name already claimed");
        return;
      }
      if(!dnaNotUsed){
        let approve = window.confirm("HashAvatar with same image (DNA) was already claimed, would you like to mint it?");
        if(!approve){
          return;
        }
      }
      const ipfs = this.props.ipfs;
      const imgres = await ipfs.add(this.state.svg);
      console.log(imgres[0].hash)
      let metadata = {
          name: this.state.avatar.name,
          image: `ipfs://${imgres[0].hash}`,
          external_url: `https://thehashavatars.com`,
          description: "Generate and mint your own avatar as ERC1155 NFT",
          attributes: [
            {
              trait_type: "Top Type",
              value: this.state.avatar.topType
            },
            {
              trait_type: "Acessories Type",
              value: this.state.avatar.accessoriesType
            },
            {
              trait_type: "Hair Color",
              value: this.state.avatar.hairColor
            },
            {
                trait_type: "Facial Hair Type",
                value: this.state.avatar.facialHairType
            },
            {
                trait_type: "Facial Hair Color",
                value: this.state.avatar.facialHairColor
            },
            {
                trait_type: "Clothe Type",
                value: this.state.avatar.clotheType
            },
            {
                trait_type: "Clothe Color",
                value: this.state.avatar.clotheColor
            },
            {
                trait_type: "Eye Type",
                value: this.state.avatar.eyeType
            },
            {
                trait_type: "Eyebrow Type",
                value: this.state.avatar.eyebrowType
            },
            {
                trait_type: "Mounth Type",
                value: this.state.avatar.mounthType
            },
            {
                trait_type: "Skin Color",
                value: this.state.avatar.skinColor
            },
            {
                trait_type: "DNA",
                value: this.state.avatar.dna
            },
          ]
      }
      console.log(metadata)
      const res = await ipfs.add(JSON.stringify(metadata));
      //const uri = res[0].hash;
      const uri = res[0].hash;
      console.log(uri);

      const id = Number(await this.props.itoken.methods.totalSupply().call()) + 1;
      console.log(id)
      const fees = [];
      await this.props.itoken.methods.mint(id,fees,this.state.supply,uri).send({
        from: this.props.coinbase,
        value: 10 ** 18
      });
    } catch(err){
      console.log(err)
    }
  }


  handleEvents = async (err, res) => {
    try {
      const web3 = this.props.web3;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      console.log(uri)
      console.log(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text())
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());


      console.log(metadata)
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }


      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      const creator = await this.props.itoken.methods.creators(res.returnValues._id).call();
      if(creator.toLowerCase() === this.props.coinbase.toLowerCase() && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }
      if (!this.state.allHashAvatars.includes(JSON.stringify(obj))) {
        this.state.allHashAvatars.push(JSON.stringify(obj));
        await this.forceUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleOnChange = (e) => {
    e.preventDefault();
    if(e.target.name === "supply"){
      this.setState({
        supply: e.target.value
      });
      return;
    }
    try{
      const web3 = this.props.web3;
      console.log(web3.utils.toBN(web3.utils.toHex(e.target.value)).toString())
      let dna = web3.utils.toBN(web3.utils.toHex(web3.utils.sha3(e.target.value))).toString().replace(".","").substring(0,21);
      console.log(dna.length)
      if(dna.length < 21){
        for(let i = 0; i < (40 - dna.length);i++){
          dna = dna + "0"
        }
      }
      dna = dna.substring(0,21);
      console.log(dna);
      let topIndex = (Number(dna.substring(0,1)) % 35 + 1).toFixed(0);
      console.log(topIndex)
      if(topIndex > this.state.top.length - 1){
        topIndex = topIndex - (this.state.top.length - 1)*(topIndex/(this.state.top.length - 1));
      }
      let accessoriesIndex = (Number(dna.substring(2,3)) % 6 + 1).toFixed(0);
      if(accessoriesIndex > this.state.accessories.length - 1){
        accessoriesIndex = accessoriesIndex - (this.state.accessories.length - 1)*(accessoriesIndex/(this.state.accessories.length - 1));
      }
      let hairColorIndex = (Number(dna.substring(4,5)) % 9 + 1).toFixed(0);
      if(hairColorIndex > this.state.hairColor.length - 1){
        hairColorIndex = hairColorIndex - (this.state.hairColor.length - 1)*(hairColorIndex/(this.state.hairColor.length - 1));
      }
      let facialHairIndex = (Number(dna.substring(6,7)) % 6 + 1).toFixed(0);
      if(facialHairIndex > this.state.facialHair.length - 1){
        facialHairIndex = facialHairIndex - (this.state.facialHair.length - 1)*(facialHairIndex/(this.state.facialHair.length - 1));
      }
      let facialHairColorIndex = (Number(dna.substring(8,9)) % 7 + 1).toFixed(0);
      if(facialHairColorIndex > this.state.facialHairColor.length - 1){
        facialHairColorIndex = facialHairColorIndex - (this.state.facialHairColor.length - 1)*(facialHairColorIndex/(this.state.facialHairColor.length - 1));
      }
      let clotheIndex = (Number(dna.substring(10,11)) % 8 + 1).toFixed(0);
      if(clotheIndex > this.state.clothes.length - 1){
        clotheIndex = clotheIndex - (this.state.clothes.length - 1)*(clotheIndex/(this.state.clothes.length - 1));
      }
      let clotheColorIndex = (Number(dna.substring(12,13)) % 14 + 1).toFixed(0);
      if(clotheColorIndex > this.state.clothesColor.length - 1){
        clotheColorIndex = clotheColorIndex - (this.state.clothesColor.length - 1)*(clotheColorIndex/(this.state.clothesColor.length - 1));
      }
      let eyeTypeIndex = (Number(dna.substring(14,15)) % 14 + 1).toFixed(0);
      if(eyeTypeIndex > this.state.eye.length - 1){
        eyeTypeIndex = eyeTypeIndex - (this.state.eye.length - 1)*(eyeTypeIndex/(this.state.eye.length - 1));
      }
      let eyebrowIndex = (Number(dna.substring(16,17)) % 11 + 1).toFixed(0);
      if(eyebrowIndex > this.state.eyebrown.length - 1){
        eyebrowIndex = eyebrowIndex - (this.state.eyebrown.length - 1)*(eyebrowIndex/(this.state.eyebrown.length - 1));
      }
      let mounthTypeIndex = (Number(dna.substring(18,19)) % 11 + 1).toFixed(0);
      if(mounthTypeIndex > this.state.mouth.length - 1){
        mounthTypeIndex = mounthTypeIndex - (this.state.mouth.length - 1)*(mounthTypeIndex/(this.state.mouth.length - 1));
      }
      let skinTypeIndex = (Number(dna.substring(20,21)) % 6 + 1).toFixed(0);
      if(skinTypeIndex > this.state.skin.length - 1){
        skinTypeIndex = skinTypeIndex - (this.state.skin.length - 1)*(skinTypeIndex/(this.state.skin.length - 1));
      }
      const avatar = {
        avatarStyle: 'Circle',
        topType: this.state.top[topIndex],
        accessoriesType: this.state.accessories[accessoriesIndex],
        hairColor: this.state.hairColor[hairColorIndex],
        facialHairType: this.state.facialHair[facialHairIndex],
        facialHairColor:  this.state.facialHairColor[facialHairColorIndex],
        clotheType: this.state.clothes[clotheIndex],
        clotheColor : this.state.clothesColor[clotheColorIndex],
        eyeType: this.state.eye[eyeTypeIndex],
        eyebrowType: this.state.eyebrown[eyebrowIndex],
        mounthType: this.state.mouth[mounthTypeIndex],
        skinColor: this.state.skin[skinTypeIndex],
        name: e.target.value,
        dna: dna
      }

      console.log(<Avatar {...avatar} />)
      console.log(ReactDOMServer.renderToString(<Avatar {...avatar} />))


      const svg = ReactDOMServer.renderToString(<Avatar {...avatar} />)


      if(this.state.avatar !== avatar) {
        this.setState({
          avatar: avatar,
          svg: svg.replace(/id="(A-z)"/g, '')
        });
      }

    } catch(err){
      console.log(err)
    }
  }

  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box w="300px"   align="center">
              <Heading>HashAvatars</Heading>
              <Avatar {...this.state.avatar} style={{width: "100px"}}/>
              <Text fontSize="sm" align="left">
                <p>The <b>HashAvatars</b> are Avatars waiting to be claimed by anyone on xDain Chain.</p>
                <br/>
                <p>Once you select the avatar's name a specific avatar figure will be generated and you can mint single or multiple copies of it.</p>
                <br/>
                <p>Choose your preferred HashAvatar and start your collection now!</p>
              </Text>
            </Box>
            <Box align="center">
              <Avatar {...this.state.avatar} />
              <Text>
                <p>Select the name of you HashAvatar and mint it!</p>
                <Input placeholder="Avatar's Name" size="md" onChange={this.handleOnChange} onKeyUp={this.handleOnChange}/>
                <Input placeholder="Total number of copies" size="md" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} name="supply"/>

                <Button onClick={this.mint}>Mint</Button>
              </Text>
            </Box>
            <Box>
            <Heading>HashAvatars Created by you</Heading>
            <SimpleGrid
              columns={{ sm: 1, md: 5 }}
              spacing="40px"
              mb="20"
              justifyContent="center"
            >
            {
              this.state.savedBlobs?.map((string) => {
                const blob = JSON.parse(string);
                return(
                    <LinkBox
                      // h="200"
                      rounded="2xl"
                      p="5"
                      borderWidth="1px"
                      _hover={{ boxShadow: '2xl' }}
                      role="group"
                      as={Link}
                      to={`/token-info/?tokenId=${blob.returnValues._id}`}
                    >
                      <Text
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <LinkOverlay
                          style={{ fontWeight: 600 }}
                          href={blob.url}
                        >
                          {blob.metadata.name}
                        </LinkOverlay>
                      </Text>
                      <Divider mt="4" />
                      {
                        (
                          blob.metadata.image.includes('ipfs://') ?
                          (
                            <center>
                              <object type="text/html"
                              data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                              width="196px"
                              style={{borderRadius: "100px"}}>
                              </object>
                            </center>
                          ) :
                          (
                            <center>
                              <img src={blob.metadata.image} width='196px' alt=""  style={{borderRadius: "100px"}} />
                            </center>
                          )
                        )
                      }
                    </LinkBox>
                )
              })
            }
            </SimpleGrid>
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default MintPage
