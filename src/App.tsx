import * as React from "react";
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
  theme,
  SimpleGrid,
  Link,
  Image,
  Center,
  Spinner,
  Avatar,
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'


import Web3 from 'web3';
import Web3Modal from "web3modal";
import Torus from "@toruslabs/torus-embed";


import ERC1155 from './contracts/ItemsERC1155.json'
import ERC20Rewards from './contracts/ERC20Rewards.json'
import ERC1155Likes from './contracts/ERC1155Likes.json'

import Nav from './components/Nav';
import MintPage from './pages/Mint';
import FeedBackPage from './pages/Feedback';
import OwnedAvatars from './pages/OwnedAvatars';
import AllAvatars from './pages/AllAvatars';
import Games from './pages/Games';
import HashAssault from './components/games/HashAssault';

import Collections from './pages/Collections';



const providerOptions = {
  injected: {
    package: null
  },
  torus: {
  package: Torus, // required
  options: {
    networkParams: {
      chainId: 0x64, // optional
      networkId: 0x64 // optional
    }
  }
}
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

class App extends React.Component {

  state = {
    netId: 0x64,
    loading: true
  }
  constructor(props){
    super(props)
    this.initWeb3 = this.initWeb3.bind(this);
    this.connectWeb3 = this.connectWeb3.bind(this);
    this.checkClaimed = this.checkClaimed.bind(this);
    this.claim = this.claim.bind(this);
    this.checkTokens = this.checkTokens.bind(this);
    this.getMetadata = this.getMetadata.bind(this);
    this.addNetwork = this.addNetwork.bind(this);

  }
  componentDidMount = async () => {
    if (web3Modal.cachedProvider) {
      await this.connectWeb3();
    } else {
      await this.initWeb3();
    }
  }


  initWeb3 = async () => {
    try{
      let coinbase
      let web3;
      if(window.location.href.includes("?rinkeby")){
        web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
      } else {
        web3 = new Web3("https://rpc.xdaichain.com/")
      }
      const netId = await web3.eth.net.getId();
      let itoken;
      let tokenLikes;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.xdai);
      }
      this.setState({
        netId: netId
      })
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
        tokenLikes: tokenLikes,
        //img: img,
        loading:false
      });

    }catch(err){
      console.log(err)
    }
  }

  connectWeb3 = async () => {
    this.setState({
      loading: true
    });
    try{
      const provider =  await web3Modal.connect();;
      const web3 = new Web3(provider);
      const coinbase = await web3.eth.getCoinbase();
      const netId = await web3.eth.net.getId();
      let itoken;
      let rewards;
      let tokenLikes;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
        rewards = new web3.eth.Contract(ERC20Rewards.abi, ERC20Rewards.rinkeby);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.xdai);
      }
      this.setState({
        web3: web3,
        itoken: itoken,
        rewards: rewards,
        tokenLikes: tokenLikes,
        coinbase:coinbase,
        netId:netId,
        loading: false,
        provider: provider
      });
      provider.on('accountsChanged', accounts => window.location.reload(true));
      provider.on('chainChanged', chainId => window.location.reload(true));
      // Subscribe to provider disconnection
      provider.on("disconnect", async (error: { code: number; message: string }) => {
        await web3Modal.clearCachedProvider();
        window.location.reload(true);
      });
    } catch(err){
      web3Modal.clearCachedProvider();
      this.initWeb3();
    }

  }

  getMetadata = async(id) => {
    const uriToken = await this.state.itoken.methods.uri(id).call();
    if(uriToken.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
      return({});
    }
    const metadataToken = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uriToken.replace("ipfs://","")}`)).text());
    return(metadataToken)
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
  checkClaimed = async (id) => {
    try{
      if(id > 1500) {
        return
      }
      const creator = await this.state.itoken.methods.creators(id).call();
      const hasClaimed = await this.state.rewards.methods.claimed(creator,id).call();
      return({
        id: id,
        creator: creator,
        hasClaimed: hasClaimed
      });
    } catch(err){
      console.log(err)
    }
  }
  claim = async (ids) => {
    try{
      const hash = await this.state.rewards.methods.claimMany(ids).send({
        from: this.state.coinbase,
        gasPrice: 1000000000
      });
      return(hash);
    } catch(err){
      console.log(err)
    }
  }
  addNetwork = async () => {
    try{
      const data = {
        chainId: "0x64", // A 0x-prefixed hexadecimal string
        chainName: "xDai",
        nativeCurrency: {
          name: "xDai",
          symbol: "xDai", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://rpc.xdaichain.com/"],
        blockExplorerUrls: 'https://blockscout.com/xdai/mainnet'
      }
      await this.state.provider.request({method: 'wallet_addEthereumChain', params:data})
    } catch(err){

    }
  }

  render(){
    return(

      <Router>
      <ChakraProvider theme={theme}>
        <Box>
          <Nav
            connectWeb3={this.connectWeb3}
            loading={this.state.loading}
            coinbase={this.state.coinbase}
            rewards={this.state.rewards}
            netId={this.state.netId}
          />
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
                          this.state.itoken ?
                          (
                            <MintPage
                              itoken={this.state.itoken}
                              rewards={this.state.rewards}
                              checkClaimed={this.checkClaimed}
                              getMetadata={this.getMetadata}
                              claim={this.claim}
                              web3={this.state.web3}
                              connectWeb3={this.connectWeb3}
                              checkTokens={this.checkTokens}
                              coinbase={this.state.coinbase}
                              provider={this.state.provider}
                              loading={this.state.loading}
                            />
                          ):
                          (
                            (this.state.netId === 4 || this.state.netId === 0x64) ?
                            (
                              <Center>
                               <VStack spacing={4}>
                                <Heading>Loading ...</Heading>
                                <Avatar
                                  size={'xl'}
                                  src={
                                    'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                  }
                                />
                                <Spinner size="xl" />
                                </VStack>
                              </Center>
                            ) :
                            (
                              <Center>
                               <VStack spacing={4}>
                                <Heading>WRONG NETWORK</Heading>
                                <Avatar
                                  size={'xl'}
                                  src={
                                    'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                  }
                                />
                                <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                                </VStack>
                              </Center>
                            )
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
                        this.state.itoken ?
                        (
                          <OwnedAvatars
                            itoken={this.state.itoken}
                            rewards={this.state.rewards}
                            checkClaimed={this.checkClaimed}
                            claim={this.claim}
                            web3={this.state.web3}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                            provider={this.state.provider}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                              </VStack>
                            </Center>
                          )
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
                        this.state.itoken ?
                        (
                          <AllAvatars
                            itoken={this.state.itoken}
                            web3={this.state.web3}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                            tokenLikes={this.state.tokenLikes}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>
              <Route path={"/game"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken ?
                        (
                          <Games
                            itoken={this.state.itoken}
                            web3={this.state.web3}
                            getMetadata={this.getMetadata}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>
              <Route path={"/gameTest"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken ?
                        (
                          <HashAssault
                            itoken={this.state.itoken}
                            web3={this.state.web3}
                            getMetadata={this.getMetadata}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            coinbase={this.state.coinbase}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route path={"/feedbacks"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken ?
                        (
                          <FeedBackPage
                            orbitdb={this.state.orbitdb}
                            ipfs={this.state.ipfs}
                            coinbase={this.state.coinbase}
                            connectWeb3={this.connectWeb3}
                            connectBox={this.connectBox}
                            space={this.state.space}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                                }
                              />
                              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>Please connect to xDai network <ExternalLinkIcon mx="2px" /></Link></p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route path={"/collections"} render={() => {
                  return(
                    <Collections/>
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
            <Link href="https://t.me/thehashavatars" isExternal>Telegram <ExternalLinkIcon mx="2px" /></Link>
            <Link href="https://twitter.com/thehashavatars" isExternal>Twitter <ExternalLinkIcon mx="2px" /></Link>
            <Link href="https://github.com/henrique1837/hashavatars-dapp" isExternal>Github <ExternalLinkIcon mx="2px" /></Link>

            </HStack>
          </Center>
        </Box>
      </ChakraProvider>

      </Router>
    )
  }
}

export default App
