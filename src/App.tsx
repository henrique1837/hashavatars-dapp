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

import Web3 from 'web3';

import IPFS from 'ipfs-http-client-lite';
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import Avatar from 'avataaars';

import ERC721 from './contracts/ItemsERC721.json'


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


class App extends React.Component {

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
    yourHashAvatars: [],

  }
  constructor(props){
    super(props)
    this.randomize = this.randomize.bind(this);
    this.initWeb3 = this.initWeb3.bind(this);
    this.mint = this.mint.bind(this);
    this.handleEvents = this.handleEvents.bind(this);
    this.handleEventsAll = this.handleEventsAll.bind(this);
  }
  componentDidMount = async () => {
    this.randomize();
    await this.initWeb3();
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

  initWeb3 = async () => {
    try{
      let coinbase
      let web3;
      //const ipfs = await IPFS.create()
      if(window.ethereum){
        await window.ethereum.enable();
        web3 = new Web3(window.ethereum);
        coinbase = await web3.eth.getCoinbase();
      } else {
        if(window.location.href.includes("?rinkeby")){
          web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
        } else {
          web3 = new Web3("https://bsc-dataseed.binance.org/")
        }
      }

      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId !== 4 && netId !== 56){
        alert('Connect to xDAI network or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC721.abi, ERC721.rinkeby);
      } else if(netId === 56){
        itoken = new web3.eth.Contract(ERC721.abi, ERC721.xdai);
      }

      let address = window.location.search.split('?address=')[1];
      if(address?.includes('&rinkeby')){
        address = address.split("&rinkeby")[0];
      }
      if(!address && coinbase){
        address = coinbase;
      }
      console.log(address)
      /*
      const profile = await getProfile(address);
      const blockie = new Image();
      blockie.src = makeBlockie(address);
      let img = blockie.src;
      if(profile.image){
        img = profile.image
      }
      */
      this.setState({
        web3: web3,
        itoken: itoken,
        //profile: profile,
        address:address,
        coinbase: coinbase,
        //img: img,
        ipfs:ipfs
      })
      const lastId = await itoken.methods.totalSupply().call();
      const promises = [];
      for(let i = 1;i<=lastId;i++){
        const res = {
          returnValues: {
            tokenId: i
          }
        }
        const owner = await itoken.methods.ownerOf(i).call();
        if(owner.toLowerCase() === coinbase.toLowerCase()){
          promises.push(this.handleEvents(null,res))
        }
        promises.push(this.handleEventsAll(null,res))
      }
      await Promise.all(promises);

      this.setState({
        loading: false
      });
      itoken.events.Transfer({
        filter: {
          from: '0x0000000000000000000000000000000000000000',
          to: address
        },
        fromBlock: 'latest'
      }, this.handleEvents);

      itoken.events.Transfer({
        filter: {
          from: '0x0000000000000000000000000000000000000000'
        },
        fromBlock: 'latest'
      }, this.handleEventsAll);
    }catch(err){
      console.log(err)
    }
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
      const ipfs = this.state.ipfs;
      const imgres = await ipfs.add(this.state.svg);
      console.log(imgres[0].hash)
      let metadata = {
          name: this.state.avatar.name,
          image: `ipfs://${imgres[0].hash}`,
          external_url: `https://thehashavatars.com`,
          description: "Generate and mint you own avatar as NFT",
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
      await this.state.itoken.methods.mint(this.state.coinbase, uri).send({
        from: this.state.coinbase,
        value: 10 ** 18
      });
    } catch(err){
      console.log(err)
    }
  }


  handleEvents = async (err, res) => {
    try {
      const web3 = this.state.web3;
      let uri = await this.state.itoken.methods.tokenURI(res.returnValues.tokenId).call();
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
      if (!this.state.savedBlobs.includes(JSON.stringify(obj))) {
        this.state.savedBlobs.unshift(JSON.stringify(obj));
        await this.forceUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }
  handleEventsAll = async (err, res) => {
    try {
      const web3 = this.state.web3;
      let uri = await this.state.itoken.methods.tokenURI(res.returnValues.tokenId).call();
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

      const owner = await this.state.itoken.methods.ownerOf(res.returnValues.tokenId).call();
      if(owner.toLowerCase() === this.state.coinbase.toLowerCase() && !this.state.yourHashAvatars.includes(JSON.stringify(obj))){
        this.state.yourHashAvatars.unshift(JSON.stringify(obj));
        await this.forceUpdate();
      }
      if (!this.state.allHashAvatars.includes(JSON.stringify(obj))) {
        this.state.allHashAvatars.unshift(JSON.stringify(obj));
        await this.forceUpdate();
      }


    } catch (err) {
      console.log(err);
    }
  }

  handleOnChange = (e) => {
    e.preventDefault();
    try{
      const web3 = this.state.web3;
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
      <ChakraProvider theme={theme}>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <ColorModeSwitcher justifySelf="flex-end" />
            <VStack spacing={1} style={{paddingBottom: "100px"}}>
              <Box w="300px"   align="center">
                <Heading>HashAvatars</Heading>
                <Avatar {...this.state.avatar} style={{width: "100px"}}/>
                <Text fontSize="sm" align="left">
                  <p>The <b>HashAvatars</b> are unique Avatars waiting to be claimed by anyone on xDain Chain.</p>
                  <br/>
                  <p>Once you mint your avatar, that unique version is only owned by you, not anyone else can mint exactly the same avatar again.</p>
                  <br/>
                  <p>Choose your preferred HashAvatar and start your collection now!</p>
                </Text>
              </Box>
            </VStack>
            <VStack spacing={8}>
              <Heading>HashAvatars</Heading>
              <Avatar {...this.state.avatar} />
              <Text>
                <p>Make your HashAvatar and mint it!</p>
                <Input placeholder="Avatar's Name" size="md" onChange={this.handleOnChange} onKeyUp={this.handleOnChange}/>
                <Button onClick={this.mint}>Mint</Button>
              </Text>

              <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                  <Tab>Info</Tab>
                  <Tab>Avatars created by you</Tab>
                  <Tab>Avatars you own</Tab>
                  <Tab>List of avatars</Tab>
                </TabList>
                <TabPanels>

                  <TabPanel>
                    <Box>
                      <Stack>
                      <SimpleGrid
                        columns={{ sm: 1, md: 2 }}
                        spacing="40px"
                        mb="20"
                        justifyContent="left"
                      >
                        <Text style={{textAlign: 'left'}} fontSize="md">
                          <p>Each HashAvatar can be minted for 1 xDai (1 USD), after that you can sell for any price you want. Your collectable can not be replicated or ever destroyed, it will be stored on Blockchain forever.</p>
                          <p>Choose your preferred HashAvatar and start your collection now!</p>
                          <br/>
                          <p>1 xDai = 1 HashAvatar</p>
                          <br/>
                          <p>The HashAvatar is built on xDai Chain, an Ethereum layer 2 sidechain that provides transactions cheaper and faster in a secure way, you must <Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>set your wallet to xDai Chain network <ExternalLinkIcon mx="2px" /></Link> in order to join.</p>
                          <p>xDai ERC721 at <Link href={`https://blockscout.com/xdai/mainnet/address/${ERC721.xdai}`} isExternal>{ERC721.xdai} <ExternalLinkIcon mx="2px" /></Link></p>

                          <br/>
                          <p>You can also use it in rinkeby testnetwork to test.</p>
                          <p>Rinkeby ERC721 at <Link href={`https://rinkeby.etherscan.io/address/${ERC721.rinkeby}`} isExternal>{ERC721.rinkeby} <ExternalLinkIcon mx="2px" /></Link></p>
                          <br/>
                          <p>This project uses "avataaars" package from <Link href="https://getavataaars.com/" isExternal>https://getavataaars.com/ <ExternalLinkIcon mx="2px" /></Link> and can be copied / modified by anyone.</p>
                        </Text>
                        <Center>
                          <Image boxSize="250px" src="https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF" />
                        </Center>
                      </SimpleGrid>
                      </Stack>
                    </Box>
                  </TabPanel>

                  <TabPanel>
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
                            to={`/token-info/?tokenId=${blob.returnValues.tokenId}`}
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
                  </TabPanel>
                  <TabPanel>

                  <SimpleGrid
                    columns={{ sm: 1, md: 5 }}
                    spacing="40px"
                    mb="20"
                    justifyContent="center"
                  >
                  {
                    this.state.yourHashAvatars?.map((string) => {
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
                            to={`/token-info/?tokenId=${blob.returnValues.tokenId}`}
                          >
                            <Text
                              fontSize="sm"
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <LinkOverlay
                                style={{  fontWeight: 600 }}
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
                  </TabPanel>
                  <TabPanel>
                  <SimpleGrid
                    columns={{ sm: 1, md: 5 }}
                    spacing="40px"
                    mb="20"
                    justifyContent="center"
                  >
                  {
                    this.state.allHashAvatars?.map((string) => {
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
                            to={`/token-info/?tokenId=${blob.returnValues.tokenId}`}
                          >
                            <Text
                              fontSize="sm"
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <LinkOverlay
                                style={{  fontWeight: 600 }}
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
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </Grid>
          <Center my="6">
            <HStack
              spacing="10px"
              fontSize="sm"
              flexDirection={{ base: 'column-reverse', lg: 'row' }}
            >
            <Link href="https://github.com/henrique1837/cryptoavatars-dapp" isExternal>Github <ExternalLinkIcon mx="2px" /></Link>
            </HStack>
          </Center>
        </Box>
      </ChakraProvider>
    )
  }
}

export default App
