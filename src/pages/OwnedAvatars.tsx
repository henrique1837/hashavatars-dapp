import * as React from "react";
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
  Center,
  Alert,
  AlertIcon,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Avatar
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'



class AllAvatars extends React.Component {

  state = {
    savedBlobs: [],
    loading: true
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
    this.checkTokens = this.props.checkTokens;
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    const promises = [];
    const results = await this.props.checkTokens();
    for(let res of results){
      promises.push(this.handleEvents(null,res));
    }
    await Promise.all(promises)
    const itoken = this.props.itoken;
    itoken.events.TransferSingle({
      filter: {
      },
      fromBlock: 'latest'
    }, this.handleEvents);

    let hasNotConnected = true;
    setInterval(async () => {
      if(this.props.provider && hasNotConnected){
        const promises = [];
        const claimed = [];
        const results = await this.props.checkTokens();
        for(let res of results){
          promises.push(this.handleEvents(null,res));
          claimed.push(this.props.checkClaimed(res.returnValues._id));
        }
        await Promise.all(promises)
        this.setState({hasNotConnected:false})

      }
    },500);
    this.setState({loading:false})
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
      if(balance > 0 && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }

    } catch (err) {
      console.log(err);
    }
  }
  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            <Heading>HashAvatars you own</Heading>
            </Box>
            <Box>
            {
              (
                this.state.loading ?
                (
                  <Center>
                   <VStack spacing={4}>
                    <p>Loading ...</p>
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
                  this.state.hasNotConnected ?
                  (
                    <Center>
                     <VStack spacing={4}>
                      <p>Connect your wallet</p>
                      <Avatar
                        size={'xl'}
                        src={
                          'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                        }
                      />
                      </VStack>
                    </Center>
                  ) :
                  (
                    this.state.savedBlobs.length == 0 ?

                    (
                      <Center>
                       <VStack spacing={4}>
                        <p>No HashAvatars here</p>
                        <Avatar
                          size={'xl'}
                          src={
                            'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                          }
                        />
                        </VStack>
                      </Center>
                    ) :
                    (
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
                            <Box
                              rounded="2xl"
                              p="5"
                              borderWidth="1px"
                              _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                            >
                              <Popover>
                                <PopoverTrigger>
                                <LinkBox
                                  // h="200"
                                  role="group"
                                  as={Link}
                                >
                                  <Text
                                    fontSize="sm"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <LinkOverlay
                                      style={{fontWeight: 600 }}
                                      href={blob.url}
                                    >
                                      {blob.metadata.name}
                                    </LinkOverlay>
                                  </Text>
                                  <Divider mt="4" />
                                  <Center>
                                    <object type="text/html"
                                    data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                                    width="196px"
                                    style={{borderRadius: "100px"}}>
                                    </object>
                                  </Center>

                                </LinkBox>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader>{blob.metadata.name}</PopoverHeader>
                                  <PopoverBody>
                                  <p><small>Token ID: {blob.returnValues._id}</small></p>
                                  <p><small><Link href={`https://epor.io/tokens/${this.props.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                                  <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.props.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            </Box>
                          )
                        })
                      }
                      </SimpleGrid>
                    )




                  )
                )
              )
            }

            </Box>
          </VStack>
        </Box>


    )
  }
}

export default AllAvatars
