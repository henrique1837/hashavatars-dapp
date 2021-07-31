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
  Avatar,
  Tooltip
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'

import makeBlockie from 'ethereum-blockies-base64';
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx'


class FeedBackPage extends React.Component {

  state = {

  }

  post = async () => {

    const msg = {
      message: this.state.msg,
      from: this.props.coinbase,
      timestamp: (new Date()).getTime()
    };
    await this.props.postFeedbacks(msg);

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
            <Box style={{wordBreak: "break-word"}}>
              <Heading>Feedbacks</Heading>
              <p><small>Suggestions? Some idea? Partnership? Make a joke? Feel free to give your feedback!</small></p>
              <p><small>OrbitDB address: {this.props.db?.address.toString()}</small></p>
            </Box>
            <Box>
              {
                (
                  this.props.db &&
                  (
                    !this.props.connecting ?
                    (
                      <>
                      <Input placeholder="Message" size="md" id="input_name" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} style={{marginBottom: '10px'}}/>
                      <Button onClick={this.post}>Post</Button>
                      </>
                    ) :
                    (
                      this.props.connecting ?
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
                !this.props.posts &&
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
              this.props.posts?.map(message => {

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
                        <Link href={`https://3box.io/${message.from !== undefined ? message.from : ""}`} isExternal>
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
