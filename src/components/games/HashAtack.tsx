
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


let web3;
let metadata;
let itoken;
let coinbase;
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
    this.cameras.main.setBackgroundColor('#24252A')
  }
  preload() {


      //this.load.baseURL = 'http://examples.phaser.io/assets/';
      this.load.image('player', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      this.load.image('bomb', "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
      this.load.image('clone',metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"))
      this.load.image('platform', 'https://ipfs.io/ipfs/QmdwU65egQPGZiwdWX7Bkjt442n99xd1imA1gKtCQXjXNd');

  }
  create () {
    this.totalMp = 0;
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.world.setBounds(0, 0, 3200, 600);
    this.cameras.main.setBounds(0, 0, 3200, 600);
    this.player = this.physics.add.sprite(1600, 150, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(300)
    this.player.scale = 0.25;
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'platform').setScale(4).refreshBody();

    this.platforms.create(1000, 130, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(1200, 280, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(3000, 380, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(2800, 280, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(1400, 300, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(1600, 370, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(2300, 440, 'platform').setScale(0.25).refreshBody();
    this.platforms.create(2500, 140, 'platform').setScale(0.25).refreshBody();

    this.platforms.create(2000, 700, 'platform').setScale(5).refreshBody();
    this.platforms.create(2000, 260, 'platform').refreshBody();

    this.platforms.create(50, 300, 'platform');
    this.platforms.create(750, 220, 'platform');


    this.clones = this.physics.add.group();


    this.physics.add.collider(this.player, this.platforms);

    this.helloWorld = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "HashAvatars", {
        font: "40px Arial",
        color: "#ffffff"
      }
    );
    this.helloWorld.setOrigin(0.5);

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);
    //this.physics.add.collider(this.bombs, this.clones);
    this.physics.add.collider(this.player, this.clones);
    this.physics.add.collider(this.bombs, this.bombs);
    this.physics.add.collider(this.platforms, this.clones);
    this.physics.add.collider(this.clones, this.clones);

    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    this.physics.add.collider(this.clones, this.bombs, this.destroyBomb, null, this);

  }
  destroyBomb (clone, bomb){
      clone.disableBody(true,true);
      bomb.disableBody(true,true);
      this.totalMp -= 1;
  }

  hitBomb (player, bomb){
      this.physics.pause();

      this.player.setTint(0xff0000);
      this.scene.restart();
  }

  generateBomb(){
    const x = Phaser.Math.Between(400, 3100);
    const bomb = this.bombs.create(x, 16, 'bomb');
    bomb.scale = 0.15
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
  }

  generateClone(){
    const x = Phaser.Math.Between(this.player.x-10, this.player.x+10)

    const bomb = this.clones.create(x, this.player.y-10, 'clone');
    bomb.setBounce(1);
    bomb.scale = 0.15
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    this.totalMp += 1;
  }
  update () {
    this.helloWorld.angle += 1;
    this.player.setVelocityX(0);
    if (cursors.left.isDown){
      this.player.setVelocityX(-280);
    }

    if (cursors.right.isDown){
      this.player.setVelocityX(280);
    }
    if (cursors.up.isDown && this.player.body.touching.down){
      this.player.setVelocityY(-480);
    }
    if(Date.now() % 23 == 0){
      if(this.totalMp < 5){
        this.generateClone();
      }
    }

    if(Date.now() % 21 == 0){
      this.generateBomb();
    }


  }
}




function Game () {
  const gameRef = useRef<HTMLIonPhaserElement>(null)
  const [game, setGame] = useState<GameInstance>()
  const [initialize, setInitialize] = useState(true)
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
        gravity: { y: 200,x:0 },
        debug: false
      }
    },
    scene: MainScene
  };
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
    web3 = this.props.web3;
    itoken = this.props.itoken;
    coinbase = this.props.coinbase;
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
                  <p>HashAttack game - avoid being touched by HashAvatars icon, use your clones to help!</p>
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
                            <p>Connect your wallet to play HashAttack</p>
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
                              <p>No HashAvatars here to play HashAttack</p>
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
