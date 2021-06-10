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
  }
  constructor(props){
    super(props)
  }
  componentDidMount = async () => {
    const hasLoggedBox = localStorage.getItem('loggedBox');
    const hasLogged = localStorage.getItem('logged');
    const posts = await Box3.getThread("hashavatars-dapp", "feedbacks","0xe3D00715710B227C73A1412552EF34EE67994fC9",false);
    this.setState({
      posts: posts.reverse()
    })
    if(hasLoggedBox && hasLogged){
      this.setState({
        connecting: true
      })
      let space = this.props.space;
      if(!space){
        space = await this.props.connectBox();
        if(space == undefined){
          const posts = await Box3.getThread("hashavatars-dapp", "feedbacks","0xe3D00715710B227C73A1412552EF34EE67994fC9",false);
          this.setState({
            posts: posts.reverse(),
            connecting: false
          });
          return;
        }
      }
      const thread = await space.joinThread('feedbacks', {
        firstModerator: "0xe3D00715710B227C73A1412552EF34EE67994fC9",
        members: false
      });
      const posts = await thread.getPosts();
      this.setState({
        space: space,
        thread: thread,
        posts: posts.reverse(),
        connecting: false
      })
      thread.onUpdate(async () => {
        const posts = await this.state.thread.getPosts();
        this.setState({
          posts: posts.reverse()
        });
      })
    }
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
                  this.state.posts &&
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
                        <>
                        <Spinner size="xl" />
                        <p><small>Connecting 3box</small></p>
                        </>
                      ) :
                      (
                        <Button onClick={this.props.connectBox}>Connect 3box</Button>
                      )
                    )
                  )
                )

              }
            </Box>
            {
              (
                !this.state.posts &&
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
                )
              )
            }
            <Box>
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
                      <small>{new Date(item.timestamp*1000).toUTCString()}</small>
                    </Box>
                  </Box>
                )
              })
            }
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default FeedBackPage
