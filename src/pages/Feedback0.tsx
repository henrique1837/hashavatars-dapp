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
import {
  ChatMessage,
  Direction,
  Environment,
  getStatusFleetNodes,
  Protocol,
  StoreCodec,
  Waku,
  WakuMessage,
} from 'js-waku';

console.log(StoreCodec)
class FeedBackPage extends React.Component {

  state = {
  }
  constructor(props){
    super(props)
  }
  componentDidMount = async () => {
    const waku = await Waku.create({
        libp2p: {
          config: {
            pubsub: {
              enabled: true,
              emitSelf: true,
            },
          },
        },
    });
    const nodes = await getStatusFleetNodes();
    await Promise.all(
      nodes.map((addr) => {
        return waku.dial(addr);
      })
    );

    waku.relay.addObserver(async (msg) => {
      console.log("Message received:", msg.payloadAsUtf8)
      this.state.posts.unshift(msg)
      await this.forceUpdate();
      console.log(this.state.posts)
    }, ["/test-hashavatars-feedback/proto"]);
    this.setState({
      waku: waku,
      posts: []
    })
    waku.libp2p.peerStore.once(
      'change:protocols',
      async ({ peerId, protocols }) => {
        if (protocols.includes(StoreCodec)) {
          console.log(
            `Retrieving archived messages from ${peerId.toB58String()}`
          );
          const messages = await waku.store.queryHistory({
            peerId,
            contentTopics: ["/test-hashavatars-feedback/proto"]
          });
          messages?.map(async (msg) => {
            this.state.posts.unshift(msg)
            await this.forceUpdate();
            console.log(this.state.posts)
          });
        }
      }
    );

  }

  post = async () => {
    const msg = WakuMessage.fromUtf8String(JSON.stringify({
      message: this.state.msg,
      from: this.props.coinbase
    }), "/test-hashavatars-feedback/proto");
    await this.state.waku.relay.send(msg);
  }

  handleOnChange = (e) => {
    this.setState({
      msg: e.target.value
    });
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
                  this.state.waku &&
                  (
                    !this.state.connecting ?
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
                        <p><small>Connecting</small></p>
                        </>
                      ) :
                      (
                        <Button onClick={this.props.connectBox}>Connect</Button>
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
                const message = JSON.parse(item.payloadAsUtf8);
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
                      <Avatar src={makeBlockie(message.from? (message.from):("anonymous"))} size='sm' alt="" />
                    </Box>
                    <Center>
                    <Box maxWidth={"80%"}>
                      <p>{message.message}</p>
                    </Box>
                    </Center>
                    <Box>
                      <small>{new Date(item.timestamp).toUTCString()}</small>
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
