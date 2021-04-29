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
  Image,
  Center,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'

import Avatar from 'avataaars';


class OwnedAvatars extends React.Component {

  state = {
    savedBlobs: [],
    hasLiked: [],
    likes: [],
    loadingLikes: []
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
    this.handleLikes = this.handleLikes.bind(this);
    this.checkTokens = this.props.checkTokens;
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    const promises = [];
    const results = await this.props.checkTokens();
    for(let res of results){
      promises.push(this.handleEvents(null,res));
    }
    await Promise.all(promises);
    const itoken = this.props.itoken;
    const tokenLikes = this.props.tokenLikes;

    itoken.events.TransferSingle({
      filter: {
      },
      fromBlock: 'latest'
    }, this.handleEvents);
    if(tokenLikes){
      tokenLikes.events.LikeOrUnlike({
        filter:{

        },
        fromBlock:'latest'
      },this.handleLikes);
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
      let likes = 0;
      let liked;
      if(this.props.tokenLikes){
        likes = await this.props.tokenLikes.methods.likes(res.returnValues._id).call();
        if(this.props.coinbase){
          liked = await this.props.tokenLikes.methods.liked(this.props.coinbase,res.returnValues._id).call();
        }
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
        this.state.savedBlobs.push(JSON.stringify(obj));
      }
      this.state.likes[obj.returnValues._id] =  {
                                                  likes: likes,
                                                  liked: liked
                                                };
      await this.forceUpdate();

    } catch (err) {
      console.log(err);
    }
  }

  handleLikes = async (err,res) => {

    let likes = 0;
    let liked;
    if(this.props.tokenLikes){
      likes = await this.props.tokenLikes.methods.likes(res.returnValues.id).call();
      if(this.props.coinbase){
        liked = await this.props.tokenLikes.methods.liked(this.props.coinbase,res.returnValues.id).call();
      }
    }

    this.state.loadingLikes[res.returnValues.id] =  true
    await this.forceUpdate();
    this.state.likes[res.returnValues.id] =  {
                                                likes: likes,
                                                liked: liked
                                              };
    this.state.loadingLikes[res.returnValues.id] =  false
    await this.forceUpdate();
  }
  like = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.props.tokenLikes.methods.like(id).send({
        from: this.props.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }

  unlike = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.props.tokenLikes.methods.unlike(id).send({
        from: this.props.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }
  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            <Heading>All HashAvatars generated</Heading>
            </Box>
            <Box>
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
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default OwnedAvatars
