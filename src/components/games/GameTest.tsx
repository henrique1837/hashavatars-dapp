
import React, { Component, useState, useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser, GameInstance } from '@ion-phaser/react'
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


let waku;
let metadata;
let players = {};

class MainScene extends Phaser.Scene {
  constructor (){
      super();
  }
  init () {
    this.cameras.main.setBackgroundColor('#24252A')
  }
  preload(){
    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));

  }
  create () {
    this.matter.world.setBounds(0, 0, 32000, 600);
    this.cameras.main.setBounds(0, 0, 32000, 600);
    this.createLandscape();

        //  Add a player ship and camera follow
    this.player = this.matter.add.sprite(1600, 200, 'ship')
        .setFixedRotation()
        .setFrictionAir(1.5)
        .setMass(30)
        .setScale(0.25);
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);

    this.cursors = this.input.keyboard.createCursorKeys();
  }
  createLandscape (){
    //  Draw a random 'landscape'
    const landscape = this.add.graphics();

    landscape.fillStyle(0x008800, 1);
    landscape.lineStyle(2, 0x00ff00, 1);

    landscape.beginPath();

    const maxY = 550;
    const minY = 400;

    let x = 0;
    let y = maxY;
    let range = 0;

    let up = true;

    landscape.moveTo(0, 600);
    landscape.lineTo(0, 550);

    do
    {
        //  How large is this 'side' of the mountain?
        range = Phaser.Math.Between(20, 100);

        if (up)
        {
            y = Phaser.Math.Between(y, minY);
            up = false;
        }
        else
        {
            y = Phaser.Math.Between(y, maxY);
            up = true;
        }

        landscape.lineTo(x + range, y);

        x += range;

    } while (x < 31000);

    landscape.lineTo(32000, maxY);
    landscape.lineTo(32000, 600);
    landscape.closePath();

    landscape.strokePath();
    landscape.fillPath();
  }


  update () {
    if (this.cursors.left.isDown)
    {
        this.player.thrustBack(0.1);
        this.player.setAngularVelocity(-0.1);
        this.player.flipX = true;
    }
    else if (this.cursors.right.isDown)
    {
        this.player.thrust(0.1);
        this.player.setAngularVelocity(0.1);
        this.player.flipX = false;
    }

    if (this.cursors.up.isDown)
    {
        this.player.thrustLeft(0.1);
    }
    else if (this.cursors.down.isDown)
    {
        this.player.thrustRight(0.1);
    }
  }
}

const gameConfig = {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            },
            enableSleeping: true
        }
    },
    scene: [ MainScene ]
};



function Game () {
  const gameRef = useRef<HTMLIonPhaserElement>(null)
  const [game, setGame] = useState<GameInstance>()
  const [initialize, setInitialize] = useState(true)

  const destroy = () => {
    gameRef.current?.destroy()
    setInitialize(false)
    setGame(undefined)
  }

  useEffect(() => {
    if (initialize) {
      setGame(Object.assign({}, gameConfig))
    }
  }, [initialize])

  return (
    <div className="App">
      <header className="App-header">
        { initialize ? (
          <>
            <IonPhaser ref={gameRef} game={game} initialize={initialize} />
            <div onClick={destroy} className="flex destroyButton">
              <a className="bttn">Destroy</a>
            </div>
          </>
        ) : (
          <>
            <div onClick={() => setInitialize(true)} className="flex">
              <a  className="bttn">Initialize</a>
            </div>
          </>
        )}
      </header>
    </div>
  );
}


class GamePage extends Component {
  state = {
    savedBlobs: [],
    loading: false
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    await this.initWaku();

    const promises = [];
    const results = await this.props.checkTokens();
    for(let res of results){
      promises.push(this.handleEvents(null,res));
    }
    await Promise.all(promises)
    let hasNotConnected = true;

    setInterval(async () => {
      if(this.props.provider && hasNotConnected){
        const promises = [];
        const claimed = [];
        const results = await this.props.checkTokens();
        for(let res of results){
          promises.push(this.handleEvents(null,res));
        }
        await Promise.all(promises)
        this.setState({hasNotConnected:false})

      }
    },500);
    this.setState({loading:false})
  }

  handleEvents = async (err, res) => {
    try {
      const web3 = this.props.web3;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      console.log(uri)
      console.log(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text())
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());


      console.log(metadata)
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      if(balance > 0 && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }

    } catch (err) {
      console.log(err);
    }
  }

  selectToken = async (id) => {
    const mt = await this.props.getMetadata(id);
    this.setState({
      gameInit: true,
      metadata: mt
    })
    metadata = mt;
  }

  initWaku = async () => {
    waku = await Waku.create({
        libp2p: {
          config: {
            pubsub: {
              enabled: true,
              emitSelf: true,
            }
          }
        },
    });
    const nodes = await getStatusFleetNodes();
    await Promise.all(
      nodes.map((addr) => {
        return waku.dial(addr);
      })
    );

    this.setState({
      waku: waku,
      posts: []
    })
    console.log(waku)
    waku.relay.addObserver(async (msg) => {
      console.log("Message received:", msg.payloadAsUtf8)
      this.state.posts.unshift(msg)
      await this.forceUpdate();
      console.log(this.state.posts)
    }, ["/test-game-v0/proto"]);

    waku.libp2p.peerStore.once(
      'change:protocols',
      async ({ peerId, protocols }) => {
        if (protocols.includes(StoreCodec)) {
          console.log(
            `Retrieving archived messages from ${peerId.toB58String()}`
          );
          const messages = await waku.store.queryHistory({
            peerId,
            contentTopics: ["/test-game-v0/proto"]
          });
          messages?.map(async (msg) => {
            this.state.posts.unshift(msg)
            await this.forceUpdate();
            console.log(this.state.posts)
          });
        }
      }
    );
    console.log('PeerId: ', waku.libp2p.peerId.toB58String());
    console.log('Listening on ');
  }
  render(){
    return(
        <>
          {
            (
              this.state.gameInit ?
              (
                <Game />
              ) :
              (
                <VStack spacing={12}>
                  <Box>
                  <Heading>Select a HashAvatar</Heading>
                  <p>HashAtack game - avoid being touched by HashAvatars icon, use your clones to help!</p>
                  <p><small><Link href="https://phaser.io/" isExternal>Done with phaser <ExternalLinkIcon /></Link></small></p>
                  <p><small><Link href="https://phaser.io/tutorials/making-your-first-phaser-3-game/part1" isExternal>Based on First Game Phaser3 tutorial <ExternalLinkIcon /></Link></small></p>
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
                            <p>Connect your wallet to play HashAtack</p>
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
                              <p>No HashAvatars here to play HashAtack</p>
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
