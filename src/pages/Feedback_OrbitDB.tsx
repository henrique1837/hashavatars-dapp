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


class FeedBackPage extends React.Component {

  state = {
  }
  constructor(props){
    super(props)
  }
  componentDidMount = async () => {



    const options = {
       // Give write access to everyone
       accessController: {
         write: ['*']
       }
     }

    const db = await this.props.orbitdb.feed('/orbitdb/zdpuAqX6oSntSdJTLAHvZis3wpLUfa5PoQ5hnvqBYq2AKzCGj/feedbacks', options)
    await db.load();
    this.setState({
      db: db
    });
    const posts = db.iterator({ limit: -1, reverse: true })
      .collect()
      .map((e) => e.payload.value);
      this.setState({
        posts: posts
    });
    db.events.on('peer', (peer) => {console.log(`Connected to ${peer}`)} )

    db.events.on('replicated', (address) => {
      const posts = db.iterator({ limit: -1, reverse: true })
        .collect()
        .map((e) => e.payload.value);
        this.setState({
          posts: posts
        });
    })


  }

  post = async () => {

    const msg = {
      message: this.state.msg,
      from: this.props.coinbase,
      timestamp: (new Date()).getTime()
    };
    await this.state.db.add(msg);
    const posts = this.state.db.iterator({ limit: -1, reverse: true })
      .collect()
      .map((e) => e.payload.value);
      this.setState({
        posts: posts
      });

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
              <p><small>Suggestions? Some idea? Partnership? Make a joke? Feel free to give your feedback!</small></p>
              <p><small>OrbitDB address: {this.state.db?.address.toString()}</small></p>
            </Box>
            <Box>
              {
                (
                  this.state.db &&
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
              this.state.posts?.map(message => {
                //const message = JSON.parse(item);
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
                      <small>{new Date(message.timestamp).toUTCString()}</small>
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
