
import React, { Component } from 'react'
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
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
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

class GamePage extends Component {
  state = {
    myHashAvatars: [],
    loading: true,
    x: [...Array(101).keys()],
    y: [...Array(101).keys()],
    positions: [],
    playerPos: [0,0],
    players: [],
    moving: false
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
  }
  componentDidMount = async () => {
    //await this.checkIsPlaying();
    //await selectToken(id);
    //if not playing
    const player = await this.props.snowflakesInvasion.methods.players(this.props.coinbase).call();

    const approved = await this.props.itoken.methods.isApprovedForAll(this.props.coinbase,this.props.snowflakesInvasion.options.address).call()

    /*
    console.log(player)

    if(player.playing){
      await this.selectToken(player.tokenId);
      this.setState({
        player: player,
        inGame: true
      });
    }
    */
    const results = await this.props.checkTokens();
    const promises = [];
    for(let res of results){
      promises.push(this.checkTokens(null,res));
    }
    await Promise.all(promises);
    this.setState({
      loading:false,
      approved: approved
    });
    this.props.snowflakesInvasion.events.PlayerMoved({
      filter: {},
      fromBlock: 'latest'
    },this.handleEvents);
  }
  checkTokens = async (err, res) => {
    try {
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      if(balance === 0){
        return;
      }
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
      } else {
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const metadata = JSON.parse(await (await fetch(uri)).text());
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }

      if(balance > 0 && !this.state.myHashAvatars.includes(JSON.stringify(obj))){
        this.state.myHashAvatars.push(JSON.stringify(obj));
        await this.forceUpdate();
      }

    } catch (err) {
      console.log(err);
    }
  }
  handleEvents = async (err, res) => {
    try {
      console.log(res.returnValue)
      const x = res.returnValues.x
      const y = res.returnValues.y
      console.log(this.props.snowflakesInvasion)
      /*
      const position = await this.props.snowflakesInvasion.methods.positions(x,y).call();
      const px = this.state.players[res.returnValues.player].from_x;
      const py = this.state.players[res.returnValues.player].from_y;
      this.state.positions[`${px}-${py}`] = null;

      this.state.positions[`${x}-${y}`] = obj
      */
      await this.forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  selectToken = async (id) => {
    const mt = await this.props.getMetadata(id);
    this.setState({
      metadata: mt,
      tokenId: id,
    })

  }

  respawn = async(id) => {
    try {
      await this.props.snowflakesInvasion.methods.respawn(this.props.itoken.options.address,id)
        .send({
          from: this.props.coinbase
        });
      const player = await this.props.snowflakesInvasion.methods.players(this.props.coinbase).call();

      this.setState({
        gameInit: true,
        player: player
      });
      this.selectToken(id)
    } catch(err){
      console.log(err);
    }
  }

  stopPlaying = async() => {
    try {
      this.setState({
        moving: true
      });
      await this.props.snowflakesInvasion.methods.stopPlaying(this.props.itoken.options.address,this.state.tokenId)
        .send({
          from: this.props.coinbase
        });
      this.setState({
        gameInit: false,
        moving: false,
        player: null,
        metadata: null,
        tokenId: null
      });
    } catch(err){
      console.log(err);
    }
  }
  approveAll = async() => {
    try {
      await this.props.itoken.methods.setApprovalForAll(this.props.snowflakesInvasion.options.address,true)
        .send({
          from: this.props.coinbase
        });
      this.setState({
        approved: true
      });
    } catch(err){
      console.log(err);
    }

  }
  move = async(x,y) => {
    try {
      this.setState({
        moving: true
      });
      await this.props.snowflakesInvasion.methods.move(this.props.itoken.options.address,this.state.tokenId,x,y)
        .send({
          from: this.props.coinbase
        });
    } catch(err){
      console.log(err);
    }
    this.setState({
      moving: false
    });
  }

  getPositionInfo = async(x,y) => {
    const position = await this.props.snowflakesInvasion.methods.positions(x,y).call();
    this.state.positions[x,y] = position;
    await this.forceUpdate();
    return(position);
  }
  render(){
    return(
        <>
          <Box style={{overflow: 'scroll'}}>
            <Table border="1" size="sm" style={{backgroundImage: `url('https://ipfs.io/ipfs/QmWEAoTDgFJ5K5WLoN3azbwD5dwbA3d8KKqSYxMUnbK8XT')`,  backgroundRepeat: 'no-repeat',  backgroundSize: 'cover' , backgroundPosition: 'center'}}>
              <Thead>
                <Tr>
                  <Th>Spawn area hashavatars</Th>
                  {
                    this.state.inGame &&
                    (
                      <>
                        <Th><Button onClick={this.stopPlaying}>Stop Playing</Button></Th>
                      </>
                    )
                  }
                  {
                    (
                      !this.state.approved &&
                      !this.state.loading &&
                      <Th>
                        <Button onClick={this.approveAll}>Approve to play game</Button>
                      </Th>
                    )
                  }
                  {
                    this.state.myHashAvatars.map(str => {
                      const obj = JSON.parse(str);

                      return(
                        <Th>
                          <Avatar src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                          <Button onClick={() => {this.respawn(obj.returnValues._id)}} size="xs">Spawn</Button>
                        </Th>
                      )
                    })
                  }
                  {/*
                    this.state.snowflakes.map(item => {
                      return(
                        <Th>Spawn area</Th>
                      )
                    })
                    */
                  }
                </Tr>
              </Thead>
              <Tbody>
              {
                this.state.moving ?
                (

                    this.state.y.map(y => {
                      return(
                        <Tr>
                          {
                            this.state.x.map(x => {
                              return(
                                <Td style={{border: "1px solid"}}>
                                <Center>
                                  {
                                    (
                                      (
                                        this.state.inGame &&
                                        Number(this.state.player?.x) === x &&
                                        Number(this.state.player?.y) === y
                                      ) &&
                                      (
                                        <Avatar src={this.state.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                                      )
                                    )
                                  }
                                  {
                                    this.state.positions[`${x}-${y}`] &&
                                    (
                                      <Avatar src={this.state.positions[`${x}-${y}`].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>

                                    )
                                  }

                                </Center>
                                </Td>
                              )
                            })
                          }
                        </Tr>
                      )
                    })
                ) :
                (

                    this.state.y.map(y => {
                      return(
                        <Tr>
                          {
                            this.state.x.map(x => {
                              return(
                                <Td style={{border: "1px solid"}}>
                                <Center>
                                  {
                                    (
                                      (
                                        this.state.inGame &&
                                        Number(this.state.player?.x) === x &&
                                        Number(this.state.player?.y) === y
                                      ) ?
                                      (
                                        <Avatar src={this.state.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                                      ) :
                                      (
                                        (Number(this.state.player?.x) >= x - 3) &&
                                        (Number(this.state.player?.y) >= y - 3) &&
                                        (Number(this.state.player?.x) <= x + 3) &&
                                        (Number(this.state.player?.y) <= y + 3) &&
                                        (
                                          <Button onClick={() => {this.move(x,y)}}size="xs">Move</Button>
                                        )
                                      )
                                    )
                                  }
                                  {
                                    this.state.positions[`${x}-${y}`] &&
                                    (
                                      <Avatar src={this.state.positions[`${x}-${y}`].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>

                                    )
                                  }

                                </Center>
                                </Td>
                              )
                            })
                          }
                        </Tr>
                      )
                    })
                )
              }
              </Tbody>
              <Tfoot>
                <Th>Spawn area snowflakes</Th>

                {/*
                  this.state.hashavatars.map(item => {
                    return(
                      <Th>Spawn area</Th>
                    )
                  })
                  */
                }
              </Tfoot>
            </Table>
          </Box>
        </>


    )
  }
}

export default GamePage
