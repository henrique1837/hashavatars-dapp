import * as React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Input,
  Link,
  Center,
  Spinner,
  Avatar,
  Tooltip
} from "@chakra-ui/react"

import makeBlockie from 'ethereum-blockies-base64';
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx'

import {
  getStatusFleetNodes,
  StoreCodec,
  Waku,
  WakuMessage,
} from 'js-waku';

class FeedBackPage extends React.Component {

  state = {
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
      const obj = JSON.parse(msg.payloadAsUtf8);
      if(obj.from !== null){
        obj.profile = await getLegacy3BoxProfileAsBasicProfile(obj.from);
      }
      const treatedMsg = {
        payloadAsUtf8: JSON.stringify(obj),
        timestamp: msg.timestamp
      };
      this.state.posts.unshift(treatedMsg)
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
            try{
              const obj = JSON.parse(msg.payloadAsUtf8);
              if(obj.from !== null){
                obj.profile = await getLegacy3BoxProfileAsBasicProfile(obj.from);
              }
              const treatedMsg = {
                payloadAsUtf8: JSON.stringify(obj),
                timestamp: msg.timestamp
              };
              this.state.posts.unshift(treatedMsg);
              this.state.posts.sort(function(x, y){
                  return y.timestamp - x.timestamp;
              });
              await this.forceUpdate();
              console.log(this.state.posts)
            } catch(err){
              console.log(err)
            }
          });
        }
      }
    );

  }

  post = async () => {
    const str = JSON.stringify({
      message: this.state.msg,
      from: this.props.coinbase
    });
    const msg = WakuMessage.fromUtf8String(str, "/test-hashavatars-feedback/proto");
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
                      <Tooltip label={message.profile?.name ? (message.profile.name) : (message.from)} aria-label={message.from}>
                        <Link href={`https://3box.io/${message.from}`} isExternal>
                          <Avatar src={
                              message.profile?.image ?
                              (
                                message.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")
                              ) :
                              (
                                makeBlockie(message.from ? (message.from):("anonymous"))
                              )
                          } size='sm' alt="" />
                        </Link>
                      </Tooltip>
                    </Box>
                    <Center>
                    <Box maxWidth={"80%"}>
                      <Text>{message.message}</Text>
                    </Box>
                    </Center>
                    <Box>
                      <Text><small>{new Date(item.timestamp).toUTCString()}</small></Text>
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
