
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
    savedBlobs: [],
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
    const totalPlayers = await this.props.snowflakesInvasion.methods.totalPlayers().call();


    console.log(player)
    if(player.tokenId){
      await this.selectToken(player.tokenId);
      this.setState({
        player: player,
        inGame: true
      });
    } else {
      const promises = [];
      const results = await this.props.checkTokens();
      for(let res of results){
        promises.push(this.handleEvents(null,res));
      }
      await Promise.all(promises);
    }
    this.setState({loading:false});
    this.props.snowflakesInvasion.events.PlayerMoved({
      filter: {},
      fromBlock: 'latest'
    },this.handleEvents);
  }

  handleEvents = async (err, res) => {
    try {
      const x = res.returnValues.x
      const y = res.returnValues.y
      const position = await this.props.snowflakesInvasion.methods.positions(x,y).call();
      let uri = await this.props.itoken.methods.uri(res.returnValues.tokenId).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      console.log(uri);
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      const px = this.state.players[res.returnValues.player].from_x;
      const py = this.state.players[res.returnValues.player].from_y;
      this.state.positions[`${px}-${py}`] = null;

      this.state.positions[`${x}-${y}`] = obj
      if(position.owner === this.props.coinbase){
        const player = await this.props.snowflakesInvasion.methods.players(this.props.coinbase).call();
        this.setState({
          player: player
        });
      }

      await this.forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  selectToken = async (id) => {
    const mt = await this.props.getMetadata(id);
    this.setState({
      gameInit: true,
      metadata: mt,
      tokenId: id,
    })

  }

  respawn = async() => {
    try {
      await this.props.snowflakesInvasion.methods.respawn(this.props.itoken.options.address,this.state.tokenId)
        .send({
          from: this.props.coinbase,
          gasPrice: 1000000000
        });
      this.setState({
        gameInit: true
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
          from: this.props.coinbase,
          gasPrice: 1000000000
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
          {
            (
              this.state.gameInit ?
              (
                <Box style={{overflow: 'scroll'}}>
                  <Table border="1" size="sm" style={{backgroundImage: `url('https://gateway.pinata.cloud/ipfs/QmWEAoTDgFJ5K5WLoN3azbwD5dwbA3d8KKqSYxMUnbK8XT')`,  backgroundRepeat: 'no-repeat',  backgroundSize: 'cover' , backgroundPosition: 'center'}}>
                    <Thead>
                      <Tr>
                        <Th>Spawn area hashavatars</Th>
                        {
                          !this.state.inGame ?
                          (
                            <>
                              <Th><Button onClick={this.respawn}>Spawn</Button></Th>
                            </>
                          ) :
                          (
                            <>
                              <Th><Button>Stop Playing</Button></Th>
                            </>
                          )
                        }
                        {
                          !this.state.inGame &&
                          (
                            <Th><Avatar src={this.state.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/></Th>
                          )
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
              ) :
              (
                <VStack spacing={12}>
                  <Box>
                  <Heading>Select a HashAvatar</Heading>
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
                            <p>Connect your wallet to play</p>
                            <p><small><Link href="https://phaser.io/" isExternal>A game done with phaser <ExternalLinkIcon /></Link></small></p>
                            <p><small><Link href="https://phaser.io/tutorials/making-your-first-phaser-3-game/part1" isExternal>Based on First Game Phaser3 tutorial <ExternalLinkIcon /></Link></small></p>
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
                              <p>No HashAvatars here to play</p>
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
                            !this.state.gameInit ?
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
                                        <LinkBox
                                          // h="200"
                                          role="group"
                                          as={Link}
                                          onClick={() => {this.selectToken(blob.returnValues._id)}}
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
                                      </Popover>
                                    </Box>
                                  )
                                })
                              }
                              </SimpleGrid>
                            ) :
                            (
                              null
                            )
                          )




                        )
                      )
                    )
                  }
                  </Box>
                </VStack>
              )
            )
          }

        </>


    )
  }
}

export default GamePage
