
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



let metadata;
let metadatas;
let gameover = false;
let cursors;
class MainScene extends Phaser.Scene {
  private helloWorld!: Phaser.GameObjects.Text
  private player: Phaser.GameObjects.Sprite

  private platforms: Phaser.GameObjects.Sprite;
  private mplatform: Phaser.GameObjects.Sprite;
  private totalMp: Phaser.GameObjects.Sprite;

  private bombs: Phaser.GameObjects.Sprite



  init () {
    //this.cameras.main.setBackgroundColor('#24252A')
  }
  preload() {


      //this.load.baseURL = 'http://examples.phaser.io/assets/';
      this.load.image("tiles", "https://ipfs.io/ipfs/QmQMdg8j9ssWbRxjKWb8JBW3PLAPvQN5cxZEP8DmhY1jrj");
      this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmeSesTyeikbLnVjQnsgvhfxJrQz6taYLZxkDsbve7ntej");
      this.load.image("player", metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      this.load.image('bomb', "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
      for(let i = 0;i<metadatas.length;i++){
        this.load.image('ha'+i, JSON.parse(metadatas[i]).metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      }

  }
  create () {

    const map = this.make.tilemap({ key: "map" });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "player")
      .setScale(0.15);
    this.player.setBounce(0.2).setCollideWorldBounds(true);
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player, worldLayer);
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();
    this.bombs = this.physics.add.group();
    this.ha = this.physics.add.group();
    this.physics.add.collider(this.bombs,worldLayer);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    this.physics.add.collider(this.bombs,this.bombs);
    this.physics.add.collider(this.ha, worldLayer);
    this.physics.add.collider(this.bombs,this.ha);
    this.physics.add.collider(this.player,this.ha);
    this.physics.add.collider(this.ha,this.ha);

    this.generateHA();

  }
  generateHA(){
    for(let i = 0;i<metadatas.length;i++){

      const x = Phaser.Math.Between(100, 1000);
      const y = Phaser.Math.Between(100, 1000);
      const ha = this.ha.create(x,y,"ha"+i);
      ha.setCollideWorldBounds(true);
      ha.setBounce(1);
      ha.setScale(0.15);
      ha.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    }
  }
  generateBomb(){
    const x = Phaser.Math.Between(100, 1000);
    const y = Phaser.Math.Between(100, 1000);

    const bomb = this.bombs.create(x, y, 'bomb');
    bomb.scale = 0.15
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-400, 400), Phaser.Math.Between(-400, 400));
  }
  hitBomb (player, bomb){
      this.physics.pause();

      this.player.setTint(0xff0000);
      this.scene.restart();
  }
  update () {
    this.player.setVelocity(0);
    if (cursors.left.isDown){
      this.player.setVelocityX(-280);
    }

    if (cursors.right.isDown){
      this.player.setVelocityX(280);
    }
    if (cursors.up.isDown){
      this.player.setVelocityY(-280);
    }
    if (cursors.down.isDown){
      this.player.setVelocityY(280);
    }
    if(Date.now() % 213 == 0){
      this.generateBomb();
    }

  }
}

const gameConfig: GameInstance = {
  width: "100%",
  height: "100%",
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0,x:0 },
      debug: false
    }
  },
  scene: MainScene
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
    metadatas = this.state.savedBlobs.filter(string => {
      const item = JSON.parse(string);
      if(item.metadata.name !== mt.name){
        return(item);
      }
    });
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
                  <p>HashVille under HashAtack game -Protect yourself! HashVille is under atack!</p>
                  <p><small><Link href="https://phaser.io/" isExternal>Done with phaser <ExternalLinkIcon /></Link></small></p>
                  <p><small><Link href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6" isExternal>Based on Modular Game Worlds in Phaser3 <ExternalLinkIcon /></Link></small></p>
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
                            <p>Connect your wallet to play HashVille under HashAtack</p>
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
                              <p>No HashAvatars here to play HashVille under HashAtack</p>
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
