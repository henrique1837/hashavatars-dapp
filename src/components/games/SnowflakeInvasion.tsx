
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
import { ExternalLinkIcon,ArrowRightIcon,ChevronDownIcon,ChevronUpIcon,WarningIcon } from '@chakra-ui/icons'
import ERC1155 from '../../contracts/ItemsERC1155.json'

class GamePage extends Component {
  state = {
    myHashAvatars: [],
    allHashAvatars: [],
    spawn: [],
    loading: true,
    x: [...Array(101).keys()],
    y: [...Array(101).keys()],
    positions: [],
    playerPos: [0,0],
    players: [],
    tokensPos: [],
    moving: false
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
    this.checkTokensPos = this.checkTokensPos.bind(this);
  }
  componentDidMount = async () => {
    //await this.checkIsPlaying();
    //await selectToken(id);
    //if not playing

    const approved = await this.props.itoken.methods.isApprovedForAll(this.props.coinbase,this.props.snowflakesInvasion.options.address).call()
    this.props.snowflakesInvasion.events.PlayerMoved({
      filter: {},
      fromBlock: 'latest'
    },this.handleEvents);
    this.setState({
      approved: approved
    });
    const promisesSF = [];
    const lastId = await this.checkTokensSnowflakes();

    for(let i = 0; i < lastId; i++){
      promisesSF.push(this.checkTokensPos(this.state.hashAvatars,i));
    }
    await Promise.all(promisesSF)
    setInterval(async () => {
      if(this.props.savedBlobs.length !== this.state.allHashAvatars.length){
        this.state.allHashAvatars = this.props.savedBlobs;
        this.state.allHashAvatars.map(async str => {
          const obj = JSON.parse(str);
          if(this.props.coinbase){
            const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,obj.returnValues._id).call();

            if(!this.state.myHashAvatars.includes(JSON.stringify(obj)) &&
               balance > 0){
              this.state.myHashAvatars.push(JSON.stringify(obj));
            }

          }
        })
        this.forceUpdate();
      } else if(!this.state.checkedTokensPositions) {
        this.setState({
          checkedTokensPositions: true
        })
        const promises = [];
        for(let i = 0;i<this.state.allHashAvatars.length;i++){
          //await this.checkTokensPos(this.props.itoken,i);
          promises.push(this.checkTokensPos(this.props.itoken,i))
        }
        await Promise.all(promises);
        this.setState({
          loading: false,
        });
      }

    },1000);


  }
  checkTokensSnowflakes = async () => {
    const colletible = await this.props.snowflakesInvasion.methods.collectibles(1).call();

    const itoken = new this.props.web3.eth.Contract(ERC1155.abi, colletible);

    const lastId = await itoken.methods.totalSupply().call();

    this.setState({
      snowFlakes: itoken
    })
    return(lastId)
  }
  checkTokensPos = async (collectible,id) => {
    try {
      const ownerAddr = await this.props.snowflakesInvasion.methods.tokenPlayer(collectible.options.address,id).call();
      if(Number(ownerAddr) === 0){
        return;
      }
      const player = await this.props.snowflakesInvasion.methods.players(ownerAddr).call();
      const tokenPos = await this.props.snowflakesInvasion.methods.getTokenPos(ownerAddr,id).call();
      const x = tokenPos.x
      const y = tokenPos.y

      let uri = await collectible.methods.uri(id).call();

      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
      } else {
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const metadata = JSON.parse(await (await fetch(uri)).text());
      const position = await this.props.snowflakesInvasion.methods.positions(x,y).call();
      //const px = this.state.players[res.returnValues.player].from_x;
      //const py = this.state.players[res.returnValues.player].from_y;
      //this.state.positions[`${px}-${py}`] = null;
      const obj = {
        owner: ownerAddr,
        tokenId: id,
        collectible: collectible.options.address,
        metadata: metadata
      }
      if(Number(y) === 0 &&
         Number(x) === 0 &&
         ownerAddr.toLowerCase() === this.props.coinbase.toLowerCase()){


        if(!this.state.spawn.includes(JSON.stringify(obj))){
          this.state.spawn.push(JSON.stringify(obj));
        }
        this.setState({
          inGame: true
        });
        await this.forceUpdate();
        return
      }

      this.state.spawn = this.state.spawn.filter(str => {
        const obj = JSON.parse(str);
        return Number(obj.tokenId) !== Number(id)
      })
      console.log(this.state.spawn.filter(str => {
        const obj = JSON.parse(str);

        return obj.tokenId !== id
      }))
      this.state.positions[`${x}-${y}`] = obj;
      this.state.tokensPos[id] = tokenPos;

      if(ownerAddr.toLowerCase() === this.props.coinbase.toLowerCase()){
        this.setState({
          inGame: true
        });
      }
      await this.forceUpdate();

    } catch (err) {
      console.log(err);
    }
  }
  handleEvents = async (err, res) => {
    try {
      const colletible = new this.props.web3.eth.Contract(ERC1155.abi,res.returnValues.collectible);
      const tokenId = res.returnValues.tokenId;
      const from = this.state.tokensPos[tokenId];
      if(from){
        this.state.positions[`${from.x}-${from.y}`] = false;
        await this.forceUpdate()
      }
      await this.checkTokensPos(colletible,tokenId);
    } catch (err) {
      console.log(err);
    }
  }

  selectToken = async (id) => {
    //const playerAddress = await this.props.snowflakesInvasion.methods.tokenPlayer(this.props.itoken.options.address,id).call();
    const playerAddress = await this.props.coinbase;

    const player = await this.props.snowflakesInvasion.methods.players(playerAddress).call();
    const tokenPos = await this.props.snowflakesInvasion.methods.getTokenPos(playerAddress,id).call();
    this.setState({
      player: player,
      tokenPos: tokenPos,
      tokenId: id,
    })

  }

  unselectToken =  () => {

    this.setState({
      tokenPos: null,
      tokenId: null,
    })

  }

  respawn = async(id) => {
    try {
      await this.props.snowflakesInvasion.methods.respawn(this.props.itoken.options.address,id)
        .send({
          from: this.props.coinbase
        });
      //this.selectToken(id);
    } catch(err){
      console.log(err);
    }
  }

  stopPlaying = async() => {
    try {
      this.setState({
        moving: true
      });
      await this.props.snowflakesInvasion.methods.stopPlaying()
        .send({
          from: this.props.coinbase
        });
      this.setState({
        inGame: false,
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
        moving: true,
        tokenId: null
      });
      await this.props.snowflakesInvasion.methods.move(this.state.tokenId,x,y)
        .send({
          from: this.props.coinbase
        });
    } catch(err){
      console.log(err);
      this.setState({
        moving: false,
      });
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
        <VStack spacing={3}>
          <Box>
            <Heading>SnowflakesInvasion</Heading>
            <Text fontSize="md" style={{wordBreak: 'break-all'}}>
              <p>SnowflakesHash are atacking HashNation! We need to defend ourselfs!</p>
              <p>Select a HashAvatar(s) you own and defend the HashNation!</p>
              <p>Each movement needs to wait at least 50 blocks until next movement.</p>
              <p>Move to a field occupied by a SnowflakeHash to atack it!</p>
              <p>The unit that loose a battle is returned to the owner, the winner occupies the field occupied by the looser.</p>
              <p>HashAvatars units can not atack each other or occcupy same field.</p>
              <p><small><Link href="https://azgaar.github.io/Fantasy-Map-Generator/" isExternal>Map generated with Azgaar's Fantasy Map Generator<ExternalLinkIcon /></Link></small></p>
              <p><small><Link href={
                this.props.netId === 4 ?
                 `https://rinkeby.etherscan.io/address/${this.props.snowflakesInvasion.options.address}` :
                 `https://blockscout.com/xdai/mainnet/address/${this.props.snowflakesInvasion.options.address}`
               } isExternal>Smart contract at {this.props.snowflakesInvasion.options.address}<ExternalLinkIcon /></Link></small></p>

            </Text>
          </Box>
          <Box style={{overflow: 'scroll',maxWidth: '1200px',maxHeight: '500px'}}>
            <Table border="1" size="sm" style={{backgroundImage: `url('https://ipfs.io/ipfs/QmWEAoTDgFJ5K5WLoN3azbwD5dwbA3d8KKqSYxMUnbK8XT')`,  backgroundRepeat: 'no-repeat',  backgroundSize: 'cover' , backgroundPosition: 'center'}}>
              <Thead>
                <Tr>
                  <Th>
                    <p>Spawn area hashavatars</p>
                    <HStack spacing={2} style={{overflowX: 'auto',maxWidth: document.body.clientWidth - document.body.clientWidth*0.85}}>

                    {
                      this.state.spawn.map(str => {
                        const obj = JSON.parse(str);
                        return(
                          <VStack spacing={1}>
                          <Avatar src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                          {
                            !this.state.tokenId &&
                            <Button onClick={() => {this.selectToken(obj.tokenId)}} size="xs"><ArrowRightIcon/></Button>
                          }
                          </VStack>
                        )
                      })
                    }
                    </HStack>
                  </Th>
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
                    this.state.approved &&
                    !this.state.loading ?
                    this.state.myHashAvatars.map(str => {
                      const obj = JSON.parse(str);

                      return(
                        <Th>
                          <Avatar src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                          <Button onClick={() => {this.respawn(obj.returnValues._id)}} size="xs">Spawn</Button>
                        </Th>
                      )
                    }) :
                    this.state.approved &&
                    <Th>
                      <VStack spacing={1}>
                        <Spinner />
                        <small> loading game</small>
                      </VStack>
                    </Th>
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
                                    this.state.positions[`${x}-${y}`] &&
                                    <Avatar src={this.state.positions[`${x}-${y}`].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
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
                                      this.state.tokenId &&
                                      (Number(this.state.tokenPos.x) >= x - 3) &&
                                      (Number(this.state.tokenPos.y) >= y - 3) &&
                                      (Number(this.state.tokenPos.x) <= x + 3) &&
                                      (Number(this.state.tokenPos.y) <= y + 3) &&
                                      this.state.positions[`${x}-${y}`]?.collectible !== this.state.player.collectible &&
                                      (
                                        this.state.positions[`${x}-${y}`]?.tokenId === this.state.tokenId ?
                                        <Button onClick={this.unselectToken} size="xs"><ChevronUpIcon /></Button> :
                                        this.state.positions[`${x}-${y}`]?.collectible ?
                                        <Button onClick={() => {this.move(x,y)}} size="xs" colorScheme="red"><ChevronDownIcon /></Button> :
                                        <Button onClick={() => {this.move(x,y)}} size="xs"><ChevronDownIcon /></Button>
                                      )
                                    )
                                  }
                                  {
                                    this.state.positions[`${x}-${y}`] &&
                                    (
                                      <>
                                      <Avatar src={this.state.positions[`${x}-${y}`].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="md"/>
                                      {

                                        this.state.positions[`${x}-${y}`].owner.toLowerCase() === this.props.coinbase.toLowerCase() &&
                                        !this.state.tokenId &&
                                        <Button onClick={() => {this.selectToken(this.state.positions[`${x}-${y}`].tokenId)}} size="xs"><ArrowRightIcon /></Button>

                                      }
                                      </>
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
        </VStack>


    )
  }
}

export default GamePage
