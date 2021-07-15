
import React, { Component, useState, useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser, GameInstance } from '@ion-phaser/react'
import {
  Box,
  Heading,
  Text,
  VStack,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Divider,
  Link,
  Center,
  Spinner,
  Popover,
  Avatar,
  Input,
  Button,
  Image,
  HStack
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'

import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebRTCStar from 'libp2p-webrtc-star'
import { NOISE } from 'libp2p-noise'
import Mplex from 'libp2p-mplex'
import Bootstrap from 'libp2p-bootstrap'
import Room from 'ipfs-pubsub-room';
import Gossipsub from 'libp2p-gossipsub'


let libp2p;
let metadata;
let metadatas = [];
let players = [];
let loaded = [];
let coinbase;
let cursors;
let room;
class MainScene extends Phaser.Scene {

  constructor (){
      super();
  }
  init () {
    this.cameras.main.setBackgroundColor('#24252A')
  }
  preload(){
    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    this.load.image("tiles", "https://ipfs.io/ipfs/QmVpCeH52ya9gWdGnsa1u6z7kDLTPosUoPxhuYkwfqgKqi");
    //this.load.image("background", "https://ipfs.io/ipfs/QmQuEkDthgq6Hd5XWpUYZQ3oEoopHbt3X6EH2EwapSGxUA");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmNhhHG84xkV4h8s8vBw6bQHncDwzyvcJZ8eAUqgmKMi63");

    for(let i = 0;i<metadatas.length;i++){
      this.load.image(metadatas[i].metadata.name, metadatas[i].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    }
  }
  addOtherPlayers(playerInfo) {
    const otherPlayer = this.physics.add.sprite(0, 0,  playerInfo.name).setScale(0.05);
    otherPlayer.setBounce(0.2).setCollideWorldBounds(true);
    otherPlayer.name = playerInfo.name
    this.otherPlayers.add(otherPlayer);
  }
  create () {

    const map = this.make.tilemap({ key: "map" });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //this.add.image(1000,1020,'background')
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("AllAssetsPreview", "tiles");
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const bellowLayer = map.createStaticLayer("Ground", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });


    this.room = room;
    this.otherPlayers = this.physics.add.group();


    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    //this.createLandscape();
    this.cameras.main.setZoom(6);

    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(Phaser.Math.Between(800, 1300), Phaser.Math.Between(800, 1600), 'ship')
        .setScale(0.05);
    this.player.setBounce(0.2).setCollideWorldBounds(true);
    this.player.name = metadata.name;
    //this.physics.add.collider(this.player, this.otherPlayers);
    //this.physics.add.collider(this.otherPlayers, this.otherPlayers);
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
    this.cameras.main.setZoom(2);

    cursors = this.input.keyboard.createCursorKeys();

    room.on('message', async (message) => {

      try{
        const msg = new TextDecoder('utf-8').decode(message.data);
        console.log(msg);
        const obj = JSON.parse(msg);
        if(obj.type === "movement"){
          this.setPlayerPosition(obj);
        }
        if(obj.type === "collision"){
          if(obj.name === metadata.name){
            this.player.setPosition(Phaser.Math.Between(800, 1300),Phaser.Math.Between(800, 1600));
            const msg = JSON.stringify({
              message: `${metadata.name} died!`,
              from: coinbase,
              timestamp: (new Date()).getTime(),
              metadata: metadata,
              type: "message"
            });

            this.setPlayerPosition({
              player: this.player,
              metadata: metadata
            });
            await this.room.broadcast(msg);
          }
        }
      } catch(err){
        console.log(err)
      }

    });

    room.on('peer', async (peer) => {

      console.log(peer);

    })



    this.physics.add.collider(this.player,this.otherPlayers,this.hitEnemy,null, this);

    this.physics.add.collider(this.player,worldLayer);
    this.physics.add.collider(this.otherPlayers,worldLayer);
    this.playerMoved();

    const msg = JSON.stringify({
      message: `${metadata.name} joined HashIsland!`,
      from: coinbase,
      timestamp: (new Date()).getTime(),
      metadata: metadata,
      type: "message"
    });
    this.room.broadcast(msg);

  }

  hitEnemy = async (player, enemy) => {
      if(enemy.body.touching.up){
        const msg = JSON.stringify({
          name: enemy.name,
          type: "collision"
        });
        enemy.destroy();
        await this.room.broadcast(msg);
      } else if(player.body.touching.up) {
        const msg = JSON.stringify({
          name: player.name,
          type: "collision"
        });
        await this.room.broadcast(msg);
      } else {
        player.setVelocityX(0);
        player.setVelocityY(0);

        enemy.setVelocityX(0);
        enemy.setVelocityX(0);
      }
  }

  setPlayerPosition(objPlayer){

    let added = false;
    this.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (objPlayer.metadata.name === otherPlayer.name) {
        otherPlayer.setPosition(objPlayer.player.x, objPlayer.player.y);
        added = true;
      }
    });
    if(!added && objPlayer.metadata.name !== metadata.name){
      this.addOtherPlayers(objPlayer.metadata);
    }
  }

  playerMoved = async () => {
    const msg = JSON.stringify({
      metadata: metadata,
      player: this.player,
      from: coinbase,
      type: "movement"
    });
    await this.room.broadcast(msg);
  }
  update () {

    //this.player.setVelocity(0);
    if (cursors.left.isDown){
      this.player.setVelocityX(-150);
      this.playerMoved();
    } else if (cursors.right.isDown){
      this.player.setVelocityX(150);
      this.playerMoved();
    } else if (cursors.up.isDown){
      this.player.setVelocityY(-150);
      this.playerMoved();
    } else if (cursors.down.isDown){
      this.player.setVelocityY(150);
      this.playerMoved();
    } else {
      this.player.setVelocity(0);
    }
  }
}

const gameConfig = {
    type: Phaser.AUTO,
    width: "60%",
    height: "90%",
    physics: {
        default: 'arcade',
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
    msgs: [],
    loading: true,
    totalPlayers: 0
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    try {
      await this.initRoom();
      const promises = [];
      const results = await this.props.checkTokens();
      for(let res of results){
        promises.push(this.handleEvents(null,res));
      }
      await Promise.all(promises);
      coinbase = this.props.coinbase;
      let hasNotConnected = true;

      setInterval(async () => {
        if(this.props.provider && hasNotConnected){
          const promises = [];
          const results = await this.props.checkTokens();
          for(let res of results){
            promises.push(this.handleEvents(null,res));
          }
          await Promise.all(promises)
          hasNotConnected = false;
        }
      },500);
      this.setState({loading:false});

    } catch(err){
      this.setState({
        loading:false
      });
    }
  }

  handleEvents = async (err, res) => {
    try {
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
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
      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      if(balance > 0 && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }
      metadatas.push(obj)
      this.setState({loading:false});

    } catch (err) {
      console.log(err);
    }
  }


  initRoom = async () => {

    if(!this.props.libp2p){
      libp2p = await this.props.initLibp2p();
    } else {
      libp2p = this.props.libp2p;
    }
    room = new Room(libp2p, 'hashavatars-dapp-hashoperation-game-'+this.props.itoken.options.address)



    this.setState({
      libp2p: libp2p,
      room: room
    })

    room.on('message', async (message) => {
      const msg = new TextDecoder('utf-8').decode(message.data);
      const obj = JSON.parse(msg);
      if(obj.type === "message"){
        this.state.msgs.unshift(msg);
        await this.forceUpdate();
      }
    })
    room.on('peer joined', (cid) => {
      console.log(`Joined ${cid}`)
      this.setState({
        totalPlayers: this.state.totalPlayers + 1
      })
    })

    room.on('peer left', (cid) => {
      console.log(`Left ${cid}`)
      this.setState({
        totalPlayers: this.state.totalPlayers - 1
      })
    })

    room.once('subscribed',() => {
      console.log(`Subscribed`)
      this.setState({
        totalPlayers: this.state.totalPlayers + 1
      })
    })


  }

  post = async () => {

    const msg = JSON.stringify({
      message: this.state.msg,
      from: this.props.coinbase,
      timestamp: (new Date()).getTime(),
      metadata: this.state.metadata,
      type: "message"
    });
    await this.state.room.broadcast(msg);

  }

  selectToken = async (id) => {
    const mt = await this.props.getMetadata(id);
    this.setState({
      gameInit: true,
      metadata: mt
    })
    metadata = mt;
    const inputMessage = document.getElementById('input_message');
    window.addEventListener('keydown', event => {
      if (event.which === 13) {
        this.post();
        inputMessage.value = '';
        inputMessage.innerText = '';
        this.setState({
          msg: ''
        });
      }
      if (event.which === 32) {
        if (document.activeElement === inputMessage) {
          inputMessage.value = inputMessage.value + ' ';
          this.setState({
            msg: inputMessage.value
          });
        }
      }
    });
  }

  handleOnChange = (e) => {
    e.preventDefault();
    this.setState({
      msg: e.target.value
    });
  }


  render(){
    return(
        <>
          {
            (
              this.state.gameInit ?
              (
                <>
                <HStack
                  spacing="10px"
                  fontSize="sm"
                  flexDirection={{ base: 'column-reverse', lg: 'row' }}
                >
                  <Image boxSize="20px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABfElEQVRIie2VOU4DQRBFn0diSMFEOOMADlhugAVYJIhVgsiJgZD1GGa7BBbXMCDMAbDBiFWCCDKQjMQQzG8NjNrjGRCZK2n9X69cVnd1D3TiDzH8TywOsA98ArkYfE7sjmrbxgHgAR9AIQZfEOupSWTMCWwCY/JSEbzJTajGA6Zbwd3Ag6BNeRngGMha+KxyGekt1d4Brq3BkoCa/pkLnMs7tPBl5apiU0Bd3oKtwZGSa9Kr0ldA2sKngYaYFXkb0mVbgxslB6VPpWekJ4FH/G3My5sVcyI9JH1ta/CuZI/0a0ib8/GAe3m90i8h/WZ+NM7cRk1R2/je4FnrgNaa1lGtRYItKsozF/EiVPtka2YOeV3aHHID+yH34e+1ByzLM4dsmzoWlawTjGk1osCM6ZlYB7iUN29r4OIfnod/acC/RBVaX7QK0C+9rdpboMvWAIKxawLj8uI8FXmC92gqggdgj98/dqUYPA6wS/LnukTCkR5JwCb64HTiR3wBnYJtcaM+zzsAAAAASUVORK5CYII="/><small>{this.state.totalPlayers} players connected</small>
                </HStack>
                <SimpleGrid columns={{ sm: 1, md: 3 }}>
                <Box colSpan={1}>
                  <Box>


                    <input  placeholder="Message" id='input_message' onChange={this.handleOnChange} />
                    <Button onClick={this.post}>Send Message</Button>


                  </Box>

                {
                  this.state.msgs?.map((string) => {
                    const obj = JSON.parse(string);
                    return(
                      <SimpleGrid
                        columns={{ sm: 1,md:2}}
                        spacing="5px"
                        mb="2"
                        justifyContent="center"
                      >
                        <Box colSpan={2}>
                          <Avatar src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size='sm' />
                          <p><small>{obj.metadata.name}</small></p>
                        </Box>
                        <Box colSpan={3}>
                          <Text>{obj.message}</Text>
                        </Box>
                      </SimpleGrid>

                    )
                  })
                }
                </Box>
                  <Box colSpan={2}>
                    <Game />
                  </Box>

                </SimpleGrid>
                </>
              ) :
              (
                <VStack spacing={12}>
                  <Box>
                  <Heading>Select a HashAvatar</Heading>
                  <p>HashOperation game (beta) - HashIsland is under war! Kill all others players by touching their head! Survive!</p>
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
                            <p>Connect your wallet to play HashOperation</p>
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
                          this.state.savedBlobs.length === 0 ?

                          (
                            <Center>
                             <VStack spacing={4}>
                              <p>No HashAvatars here to play HashOperation</p>
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
