import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink,Box,LoadingRing } from '@aragon/ui';

import { useAppContext } from '../../hooks/useAppState';

let metadata;
let contractAddress;
let metadatas = [];
let players = [];
let loaded = [];
let coinbaseGame;
let cursors;
let room;
const topicMovements = 'hash-avatars/games/first-contact/movements';
const topic = 'hash-avatars/games/first-contact';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  init(){
    this.cameras.main.setBackgroundColor('#24252A')
  }

  preload = () => {
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;
    let loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    let percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    let assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    assetText.setOrigin(0.5, 0.5);
    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    this.load.image("tiles", "https://ipfs.io/ipfs/bafkreier6xkncx24wj4wm7td3v2k3ea2r2gpfg2qamtvh7digt27mmyqkm");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/bafybeiflup6dpz7wcqdi5k7u43pb722ietk3tlr2iknip635p3r4gg2sie");


  }

  create = async () => {
    const map = this.make.tilemap({key: 'map'});
    //this.add.image(1000,1020,'background')
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Pody.stop();ody.stop();haser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("!CL_DEMO_32x32", "tiles");
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const bellowLayer = map.createLayer("Ground", tileset, 0, 0);
    const worldLayer = map.createLayer("Layer1", tileset, 0, 0);
    const waterLayer = map.createLayer("Water", tileset, 0, 0);
    const layer2 = map.createLayer("Layer2", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    waterLayer.setCollisionByProperty({ collides: true });
    layer2.setCollisionByProperty({ collides: true });
    worldLayer.setCollisionByExclusion([-1]);
    waterLayer.setCollisionByExclusion([-1]);
    layer2.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.room = room;
    this.otherPlayers = this.physics.add.group();
    this.friendlyPlayers = this.physics.add.group();


    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //this.createLandscape();
    this.cameras.main.setZoom(2);

    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(Phaser.Math.Between(500, 4500), Phaser.Math.Between(500, 4500), 'ship');
    this.player.setBounce(0).setCollideWorldBounds(true);
    this.player.displayWidth = 64;
    //scale evenly
    this.player.scaleY = this.player.scaleX;
    this.player.name = metadata.name;
    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
    this.cameras.main.setZoom(1);

    this.physics.add.collider(this.player,worldLayer);
    this.physics.add.collider(this.player,layer2);
    this.physics.add.collider(this.player,waterLayer);


    this.physics.add.collider(this.otherPlayers,worldLayer);
    this.physics.add.collider(this.otherPlayers,layer2);
    this.physics.add.collider(this.otherPlayers,waterLayer);

    this.physics.add.collider(this.friendlyPlayers, worldLayer);
    this.physics.add.collider(this.friendlyPlayers, layer2);
    this.physics.add.collider(this.friendlyPlayers, waterLayer);

    cursors = this.input.keyboard.createCursorKeys();

    room.pubsub.subscribe(topicMovements,this.handleMessages);



    this.physics.add.collider(this.player,this.friendlyPlayers,(player,friend) => {
      player.setVelocity(0,0);
      player.setAcceleration(0,0);
      player.stop();
      friend.setVelocity(0,0);
      friend.setAcceleration(0,0);
      friend.stop();
    },null,this);
    this.physics.add.collider(this.player,this.otherPlayers,this.handleCollision,null, this);


    this.sendMessagePlayerEntered();



  }

  update = async () => {

    //this.player.setVelocity(0);

    const msg = JSON.stringify({
      contractAddress: contractAddress,
      metadata: metadata,
      player: this.player,
      from: coinbaseGame,
      type: "movement"
    });
    if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
    }
    if (cursors.left.isDown){
      this.player.setVelocityX(-150);
    } else if (cursors.right.isDown){
      this.player.setVelocityX(150);
    } else if (cursors.up.isDown){
      this.player.setVelocityY(-150);
    } else if (cursors.down.isDown){
      this.player.setVelocityY(150);
    } else {
      this.player.setVelocity(0);
    }

  }

  handleMessages = async (msg) => {
    try{
      const obj = JSON.parse(new TextDecoder().decode(msg.data));
      if(obj.type === "movement"){
        let added = false;
        this.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress !== contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        this.friendlyPlayers.getChildren().forEach(function (otherPlayer) {
          if (obj.metadata.name === otherPlayer.name && obj.contractAddress === contractAddress) {
            otherPlayer.setVelocityX(0);
            otherPlayer.setVelocityY(0);
            otherPlayer.setPosition(obj.player.x, obj.player.y);
            added = true;
          }
        });
        if(!added && obj.metadata.name !== metadata.name){
          const otherPlayer = this.physics.add.sprite(0, 0,  obj.metadata.name)
            .setInteractive();
          otherPlayer.setBounce(0);
          otherPlayer.setVelocityX(0);
          otherPlayer.setVelocityY(0);
          otherPlayer.scaleX = this.player.scaleX;
          otherPlayer.scaleY = otherPlayer.scaleX;

          otherPlayer.setCollideWorldBounds(true);
          otherPlayer.name =  obj.metadata.name
          otherPlayer.contractAddress = obj.contractAddress;
          const loader = new Phaser.Loader.LoaderPlugin(this);

          loader.image(obj.metadata.name,obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
          loader.once(Phaser.Loader.Events.COMPLETE, () => {
            // texture loaded so use instead of the placeholder
            otherPlayer.setTexture(obj.metadata.name)
          })
          loader.start();
          otherPlayer.on('pointerdown', function (pointer) {
            window.open(obj.metadata.external_url,"_blank");
          });
          if(obj.contractAddress !== contractAddress){
            this.otherPlayers.add(otherPlayer);
          } else {
            this.friendlyPlayers.add(otherPlayer);
          }
        }
      }
      if(obj.type === "collision"){
        if(obj.name === metadata.name){
          this.player.setPosition(Phaser.Math.Between(500, 4600),Phaser.Math.Between(500, 4600));
          const str = JSON.stringify({
            message: `${metadata.name} died!`,
            from: coinbaseGame,
            timestamp: (new Date()).getTime(),
            metadata: metadata,
            type: "message"
          });
          const msgSend = new TextEncoder().encode(str)
          await room.pubsub.publish(topic, msgSend)
        }
      }
    } catch(err){
      console.log(err)
    }
  }

  handleCollision = async (player, otherPlayer) => {
    if(otherPlayer.body.touching.up){
      const msg = JSON.stringify({
        name: otherPlayer.name,
        type: "collision"
      });
      otherPlayer.destroy();
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
    } else if(player.body.touching.up) {
      const msg = JSON.stringify({
        name: player.name,
        type: "collision"
      });
      const msgSend = new TextEncoder().encode(msg)
      await room.pubsub.publish(topicMovements, msgSend)
    }
    player.setVelocity(0,0);
    player.setAcceleration(0,0);
    player.stop();
    otherPlayer.setVelocity(0,0);
    otherPlayer.setAcceleration(0,0);
    otherPlayer.stop();
  }

  sendMessagePlayerEntered = async () => {
    let msg = JSON.stringify({
      message: `${metadata.name} joined HashVillage!`,
      from: coinbaseGame,
      timestamp: (new Date()).getTime(),
      metadata: metadata,
      type: "message"
    });

    let msgSend = new TextEncoder().encode(msg)
    await room.pubsub.publish(topic, msgSend)


    msg = JSON.stringify({
      metadata: metadata,
      contractAddress: contractAddress,
      player: this.player,
      from: coinbaseGame,
      type: "movement"
    });


    msgSend = new TextEncoder().encode(msg)
    await room.pubsub.publish(topicMovements, msgSend)
  }
}


const game = {
  width: "50%",
  height: "60%",
  type: Phaser.AUTO,
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

export default function FirstContact () {
  const gameRef = useRef(null);
  const { state } = useAppContext();
  const [msgs,setMsgs] = useState([]);
  const [metadataPlayer,setMetadataPlayer] = useState();
  // Call `setInitialize` when you want to initialize your game! :)
  const [initialize, setInitialize] = useState(false);
  const [msg,setMsg] = useState();
  const [subscribed,setSubscribed] = useState();
  const [peers,setPeersIds] = useState(0);
  const destroy = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
    }
    setInitialize(false)
  }



 const post =  useCallback(async () => {
    const inputMessage = document.getElementById('input_message');
    const msgString = JSON.stringify({
      message: msg,
      from: state.coinbase,
      timestamp: (new Date()).getTime(),
      metadata: metadataPlayer,
      type: "message"
    });
    const msgToSend = new TextEncoder().encode(msgString)

    await state.ipfs.pubsub.publish(topic, msgToSend);
    inputMessage.value = '';
    inputMessage.innerText = '';
    setMsg('');

  },[state.ipfs,state.coinbase,metadataPlayer,document.getElementById('input_message'),msg]);

  const setMetadata = (mt) => {
      metadata = mt;
      coinbaseGame = state.coinbase;
      setMetadataPlayer(mt);
      setInitialize(true);
  }

  useMemo(() => {
    metadatas = state.nfts.map(str => {
      const obj = JSON.parse(str);
      return(obj.metadata);
    });
  },[state.nfts]);

  useMemo(async () => {
    if(state.hashavatars && state.ipfs && !subscribed){
      contractAddress = state.hashavatars.address;
      await state.ipfs.pubsub.subscribe(topic, async (msg) => {
        console.log(new TextDecoder().decode(msg.data));
        const obj = JSON.parse(new TextDecoder().decode(msg.data));
        const newMsgs = msgs;
        newMsgs.unshift(obj);
        setMsgs(newMsgs);
      });
      setInterval(async () => {
        const newPeerIds = await state.ipfs.pubsub.peers(topicMovements);
        setPeersIds(newPeerIds);
      },5000)

      room = state.ipfs;
      setSubscribed(true);

    }

  },[state.hashavatars,state.ipfs,msgs]);

  useMemo(()=>{
    const inputMessage = document.getElementById('input_message');
    window.addEventListener('keydown', async event => {
      /*
      if (event.which === 13) {
        setMsg(inputMessage.value);
        await post();
      }
      */
      if (event.which === 32) {
        if (document.activeElement === inputMessage) {
          inputMessage.value = inputMessage.value + ' ';
          setMsg(inputMessage.value)
        }
      }
    });
  },[document.getElementById('input_message')])
  return (
    <center>
      {
        initialize ?
        <Container>
          <Row>
            <Col md={4}>
            {
              state.ipfs ?
              <>
              <p>Total of {peers?.length} players</p>
              <input  placeholder="Message" id='input_message' onChange={(e) => {setMsg(e.target.value);}} />
              <Button onClick={() => {post()}}>Send Message</Button>
              <Container>
                {
                msgs?.map((obj) => {
                  return(
                    <Row>
                      <Col md={4}>
                        <img src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size='sm'style={{width: '50px'}} />
                        <p><small>{obj.metadata.name}</small></p>
                      </Col>
                      <Col md={8}>
                        <p>{obj.message}</p>
                      </Col>
                    </Row>

                  )
                })
              }
              </Container>
              </> :
              <>
              <LoadingRing style={{width: '50px'}}/>
              <p>Loading ipfs pubsub ...</p>
              </>
            }
            </Col>
            <Col md={8}>
              {
                state.ipfs && <IonPhaser ref={gameRef} game={game} initialize={initialize} />
              }
            </Col>
          </Row>
        </Container> :
        <>
        <h4>Select a HashAvatar</h4>
        <p>HashVillage is being invaded!!!! No info about invaders.</p>
        <p><small><Link href="https://phaser.io/" external>Done with phaser <IconLink /></Link></small></p>
        <p><small><Link href="https://szadiart.itch.io/craftland-demo" external>Tileset by Szadiart <IconLink /></Link></small></p>

        {

          state.loadingMyNFTs && state.myOwnedNfts && state.totalSupply &&
          <center>
            <p>Loading your HashAvatars ...</p>
          </center>

        }
        {
          state.myOwnedNfts?.length > 0 &&
          <Container>
          <Row style={{textAlign: 'center'}}>
          {
            state.myOwnedNfts?.map(str => {
              const obj = JSON.parse(str);

              return(
                <Col style={{paddingTop:'80px'}}>

                  <center>
                    <div>
                      <p><b>{obj.metadata.name}</b></p>
                    </div>
                    <div>
                      <Image src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
                    </div>
                    <div>
                      <Button onClick={() => {setMetadata(obj.metadata)}} size="small" mode="strong">Select</Button>
                    </div>
                  </center>

                </Col>
              )
            })
          }
          </Row>
          </Container>
        }
        </>
      }
    </center>
  )
}
