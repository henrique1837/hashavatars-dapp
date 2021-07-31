
import React, { Component, useState, useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser, GameInstance } from '@ion-phaser/react'
import {
  Box,
  Heading,
  Text,
  VStack,
  theme,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Divider,
  Link,
  Center,
  Spinner,
  Popover,
  Avatar
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'



let metadata;
let metadatas;
let cursors;
let web3;
let coinbase;

class MainScene extends Phaser.Scene {
  private helloWorld!: Phaser.GameObjects.Text
  private player: Phaser.GameObjects.Sprite

  private platforms: Phaser.GameObjects.Sprite;
  private mplatform: Phaser.GameObjects.Sprite;
  private totalMp: Phaser.GameObjects.Sprite;

  private bombs: Phaser.GameObjects.Sprite;
  private enemiesKilled: Integer;

  init () {
    //this.cameras.main.setBackgroundColor('#24252A')
  }
  preload() {


      //this.load.baseURL = 'http://examples.phaser.io/assets/';
      this.load.image("tiles", "https://ipfs.io/ipfs/QmVpCeH52ya9gWdGnsa1u6z7kDLTPosUoPxhuYkwfqgKqi");
      this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmeyExGexr5gEik2weMmisawzg7Lhoq5CHWC22RSvAiea9");
      this.load.image("player", metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      this.load.image('bomb', "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
      for(let i = 0;i<metadatas.length;i++){
        this.load.image('ha'+i, JSON.parse(metadatas[i]).metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      }

  }
  create () {

    this.enemiesKilled = 0;

    const map = this.make.tilemap({ key: "map" });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("AllAssetsPreview", "tiles");
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const bellowLayer = map.createStaticLayer("Ground", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    //aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    //const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    this.player = this.physics.add
      .sprite(10,10, "player")
      .setScale(0.06);
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
    this.physics.add.collider(this.player, this.bombs, this.hitEnemy, null, this);

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
      ha.setScale(0.06);
      ha.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    }
  }
  generateBomb(){
    const x = Phaser.Math.Between(10, 3300);
    const y = Phaser.Math.Between(10, 3300);

    const bomb = this.bombs.create(x, y, 'bomb');
    bomb.setScale(0.06);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
  }

  hitEnemy (player, enemy){
      if(enemy.body.touching.up && !this.player.body.touching.up){
        enemy.destroy();
      } else if(player.body.touching.up && !enemy.body.touching.up) {
        player.setPosition(10,10);
      } else {
        enemy.destroy();
        player.setPosition(10,10);
      }
  }

  update () {
    this.input.on('pointerdown', async function (pointer) {
      try{
        await this.gameSC.move(this.input.x,this.input.y,this.player.token.address,this.player.token.id);
      } catch(err){
        console.log(err);
      }
    }, this);
    console.log(this.input)


    /*
    if (cursors.shift.isDown){
      if(!isMetamaskOpen){
        isMetamaskOpen = true;
        for(let i=0;i<10;i++){
          this.fire();
        }
        web3.eth.sendTransaction({
          from: coinbase,
          to: coinbase,
          value: 0,
          gasPrice: 1000000000
        }).once('transactionHash', (hash) => {
          isMetamaskOpen = false;
          this.specialFire();
        }).once('error',err => {
          isMetamaskOpen = false;
        }).once('confirmation', function(confirmationNumber, receipt){
          this.specialFire();
        })

      }
    }
    */
    if(Date.now() % 113 === 0){
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
      web3 = this.props.web3;
      coinbase = this.props.coinbase;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());

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
                  <p>HashAssault - Destroy enemies and survive!</p>
                  <p><small><Link href="https://phaser.io/" isExternal>Done with phaser <ExternalLinkIcon /></Link></small></p>
                  <p><small><Link href="https://merchant-shade.itch.io/16x16-mini-world-sprites" isExternal>Tilesets by Shade <ExternalLinkIcon /></Link></small></p>
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
