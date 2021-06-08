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
  Spinner,
  Alert,
  AlertIcon,
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

import makeBlockie from 'ethereum-blockies-base64';

import Box3 from '3box';

class FeedBackPage extends React.Component {

  state = {
    loading: true
  }
  constructor(props){
    super(props)
    this.connectBox = this.connectBox.bind(this);
  }
  componentDidMount = async () => {
    const hasLoggedBox = localStorage.getItem('loggedBox');
    if(hasLoggedBox){
      await this.connectBox();
    } else {
      const posts = await Box3.getThread("hashavatars-dapp", "feedbacks","0xe3D00715710B227C73A1412552EF34EE67994fC9",false);
      this.setState({
        posts:posts,
        loading: false
      })
    }
  }

  connectBox = async () => {
    this.setState({
      connecting: true
    })
    if(!this.props.coinbase){
      await this.props.initWeb3();
    }
    if(this.props.coinbase == undefined){
      alert("Install metamask or use brave browser");
      this.setState({
        connecting: false
      })
      return
    }
    const box = await Box3.create(window.ethereum)
    const spaces = ['hashavatars-dapp']
    await box.auth(spaces, {address: this.props.coinbase});
    await box.syncDone
    const space = await box.openSpace('hashavatars-dapp')
    await space.syncDone;
    const thread = await space.joinThread('feedbacks', {
      firstModerator: "0xe3D00715710B227C73A1412552EF34EE67994fC9",
      members: false
    });
    const posts = await thread.getPosts();
    this.setState({
      space: space,
      thread: thread,
      posts: posts,
      connecting: false,
      loading: false
    })
    thread.onUpdate(async () => {
      const posts = await this.state.thread.getPosts();
      this.setState({
        posts: posts
      });
    })
    localStorage.setItem('loggedBox',true);

  }

  post = async () => {
    await this.state.thread.post({
      from: this.props.coinbase,
      message: this.state.msg
    })
  }

  handleOnChange = (e) => {
    this.setState({
      msg: e.target.value
    })
  }

  render(){
    return(
        <Box>
          <VStack spacing={4}>
            <Box>
              <Heading>Feedbacks</Heading>
              <small>Suggestions? Some idea? Partnership? Make a joke? Feel free to give your feedback!</small>
            </Box>
            <Box>
              {
                (
                  this.state.space && !this.state.connecting ?
                  (
                    <>
                    <Input placeholder="Message" size="md" id="input_name" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} style={{marginBottom: '10px'}}/>
                    <Button onClick={this.post}>Post</Button>
                    </>
                  ) :
                  (
                    this.state.connecting ?
                    (
                      <Spinner size="xl" />
                    ) :
                    (
                      <Button onClick={this.connectBox}>Connect 3box</Button>
                    )
                  )
                )
              }
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
                  <>
                  {
                    this.state.posts?.map(item => {
                      return(
                        <Box style={{paddingBottom: '60px'}}>
                          <Box style={{
                            whiteSpace: "nowrap",
                            width: "100%",                   /* IE6 needs any width */
                            overflow: "hidden",              /* "overflow" value must be different from  visible"*/
                            oTextOverflow: "ellipsis",    /* Opera < 11*/
                            textOverflow:   "ellipsis",    /* IE, Safari (WebKit), Opera >= 11, FF > 6 */
                          }}
                            >
                            <Avatar src={makeBlockie(item.message.from? (item.message.from):("anonymous"))} size='sm' alt="" />
                          </Box>
                          <Center>
                          <Box maxWidth={"80%"}>
                            <p>{item.message.message}</p>
                          </Box>
                          </Center>
                          <Box>
                            <small>{new Date(item.timestamp).toUTCString()}</small>
                          </Box>
                        </Box>
                      )
                    })
                  }
                  </>
                )
              )
            }
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default FeedBackPage
