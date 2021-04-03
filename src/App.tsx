import * as React from "react";
import ReactDOMServer from 'react-dom/server';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
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
import Avatar from 'avataaars';

import ERC1155 from './contracts/ItemsERC1155.json'
import Nav from './components/Nav';
import MintPage from './pages/Mint';
import OwnedAvatars from './pages/OwnedAvatars';
import AllAvatars from './pages/AllAvatars';


const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})


class App extends React.Component {

  state = {


  }
  constructor(props){
    super(props)
    this.initWeb3 = this.initWeb3.bind(this);
    this.mint = this.mint.bind(this);
    this.checkTokens = this.checkTokens.bind(this);
  }
  componentDidMount = async () => {
    await this.initWeb3();
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
          web3 = new Web3("https://rpc.xdaichain.com/")
        }
      }

      const netId = await web3.eth.net.getId();
      let itoken;
      if(netId !== 4 && netId !== 0x64){
        alert('Connect to xDAI network or Rinkeby testnet');
      } else if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
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
      this.setState({
        loading: false
      });


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

      const id = Number(await this.state.itoken.methods.totalSupply().call()) + 1;
      console.log(id)
      const fees = [];
      await this.state.itoken.methods.mint(id,fees,this.state.supply,uri).send({
        from: this.state.coinbase,
        value: 10 ** 18
      });
    } catch(err){
      console.log(err)
    }
  }

  checkTokens = async () => {
    const itoken = this.state.itoken;
    const lastId = await itoken.methods.totalSupply().call();
    const results = [];
    for(let i = 1;i<=lastId;i++){
      const res = {
        returnValues: {
          _id: i,
        }
      }
      results.push(res)
    }
    return(results)
  }

  render(){
    return(

      <Router>
      <ChakraProvider theme={theme}>
        <Box>
          <Nav />
        </Box>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <Switch>
              <Route path={"/home"} render={() => {
                return(
                  <Box>
                    <VStack spacing={12}>
                      <Heading>HashAvatars</Heading>

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
                            <p>xDai ERC1155 at <Link href={`https://blockscout.com/xdai/mainnet/address/${ERC1155.xdai}`} isExternal>{ERC1155.xdai} <ExternalLinkIcon mx="2px" /></Link></p>

                            <br/>
                            <p>You can also use it in rinkeby testnetwork to test.</p>
                            <p>Rinkeby ERC1155 at <Link href={`https://rinkeby.etherscan.io/address/${ERC1155.rinkeby}`} isExternal>{ERC1155.rinkeby} <ExternalLinkIcon mx="2px" /></Link></p>
                            <br/>
                            <p>This project uses "avataaars" package from <Link href="https://getavataaars.com/" isExternal>https://getavataaars.com/ <ExternalLinkIcon mx="2px" /></Link> and can be copied / modified by anyone.</p>
                          </Text>
                          <Center>
                            <Image boxSize="250px" src="https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF" />
                          </Center>
                        </SimpleGrid>
                      </Stack>
                    </VStack>
                  </Box>
                  )
                }
              }/>


              <Route path={"/created-avatars"} render={() => {

                    return(
                      <>
                      {
                        (
                          this.state.itoken &&
                          (
                            <MintPage
                              itoken={this.state.itoken}
                              web3={this.state.web3}
                              initWeb3={this.initWeb3}
                              checkTokens={this.checkTokens}
                              coinbase={this.state.coinbase}
                              ipfs={ipfs}
                            />
                          )
                        )
                      }
                      </>
                    )
                  }

              }/>

              <Route path={"/owned-avatars"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken &&
                        (
                          <OwnedAvatars
                            itoken={this.state.itoken}
                            web3={this.state.web3}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                          />
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route path={"/all-avatars"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken &&
                        (
                          <AllAvatars
                            itoken={this.state.itoken}
                            web3={this.state.web3}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                          />
                        )
                      )
                    }
                    </>
                  )
                }
              }/>


              <Route render={() => {

                return(
                  <Redirect to="/created-avatars" />
                );

              }} />
            </Switch>
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

      </Router>
    )
  }
}

export default App
