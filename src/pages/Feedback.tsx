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
    loading: true
  }
  constructor(props){
    super(props)
    this.loadDB = this.loadDB.bind(this);
  }
  componentDidMount = async () => {
    const options = {
      // Give write access to everyone
      accessController: {
        write: ['*'],
        read: ['*']
      }
    }
    const db = await this.props.orbitdb.feed("/orbitdb/zdpuAyoANpG6HTbzt24Zs4hpSrJtzHc7SGBP22Sbn1q4H9aug/dapp-feedbacks",options);
    console.log(db)

    this.setState({
      db: db
    });
    await this.loadDB();


    db.events.on('peer', (peer) => console.log(peer) );
    db.events.on('write', (address, entry, heads) => {
      this.loadDB();
    }
   );

    // Listen for updates from peers
    db.events.on("replicated", address => {
      this.loadDB();
    });
  }
  loadDB = async () => {
    const db = this.state.db;
    await db.load();
    const feeds = db.iterator({ limit: -1 })
    .collect()
    .map((e) => e.payload.value);
    this.setState({
      feeds: feeds.reverse(),
      loading: false
    });
    console.log(feeds)
  }
  post = async () => {
    const db = this.state.db;
    const hash = await db.add({
      from: this.props.coinbase,
      message: this.state.msg,
      timestamp: Date.now()
    })
    await this.loadDB();
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
              <Input placeholder="Message" size="md" id="input_name" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} style={{marginBottom: '10px'}}/>
              <Button onClick={this.post}>Post</Button>
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
                    this.state.feeds?.map(item => {
                      console.log(item)
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
                            <Avatar src={makeBlockie(item.from? (item.from):("anonymous"))} size='sm' alt="" />
                          </Box>
                          <Center>
                          <Box maxWidth={"80%"}>
                            <p>{item.message}</p>
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
