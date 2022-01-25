import React, { useState,useCallback, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink,Box,LoadingRing } from '@aragon/ui';
//import Room from 'ipfs-pubsub-room';
import { Waku,WakuMessage } from 'js-waku';

import { useAppContext } from '../../hooks/useAppState';
import useIpfs from '../../hooks/useIPFS';
const contentTopic =  "/hashavatars-dapp/1/hashoperation/proto";
const contentTopicChat =  "/hashavatars-dapp/1/hashoperation_chat/proto";

let metadata;
let metadatas = [];
let players = [];
let loaded = [];
let coinbase;
let cursors;
let room;
const MainScene = {

  init: function(){
    this.cameras.main.setBackgroundColor('#24252A')
  },
  preload: function(){
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
    this.load.image("tiles", "https://ipfs.io/ipfs/QmVpCeH52ya9gWdGnsa1u6z7kDLTPosUoPxhuYkwfqgKqi");
    //this.load.image("background", "https://ipfs.io/ipfs/QmQuEkDthgq6Hd5XWpUYZQ3oEoopHbt3X6EH2EwapSGxUA");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmNhhHG84xkV4h8s8vBw6bQHncDwzyvcJZ8eAUqgmKMi63");

    for(let i = 0;i<metadatas.length;i++){
      this.load.image(metadatas[i].name, metadatas[i].image.replace("ipfs://","https://ipfs.io/ipfs/"));
    }


  },
  addOtherPlayers: function(playerInfo){
    const otherPlayer = this.physics.add.sprite(0, 0,  playerInfo.name).setScale(0.05);
    otherPlayer.setBounce(0.2).setCollideWorldBounds(true);
    otherPlayer.name = playerInfo.name
    this.otherPlayers.add(otherPlayer);
  },
  setPlayerPosition: function(objPlayer){

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
  },

  playerMoved: function(){
    const msg = JSON.stringify({
      metadata: metadata,
      player: this.player,
      from: coinbase,
      type: "movement"
    });

    WakuMessage.fromUtf8String(msg, contentTopic)
    .then(msgSend => {
      room.relay.send(msgSend);
    })

  },
  create: function(){

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
    this.cameras.main.setZoom(4);

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

    room.relay.addObserver(async (msg) => {
      try{
        const obj = JSON.parse(msg.payloadAsUtf8);
        if(obj.type === "movement"){
          let added = false;
          this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (obj.metadata.name === otherPlayer.name) {
              otherPlayer.setPosition(obj.player.x, obj.player.y);
              added = true;
            }
          });
          if(!added && obj.metadata.name !== obj.name){
            const playerInfo = obj.metadata;
            const otherPlayer = this.physics.add.sprite(0, 0,  playerInfo.name).setScale(0.05);
            otherPlayer.setBounce(0.2).setCollideWorldBounds(true);
            otherPlayer.name = playerInfo.name
            this.otherPlayers.add(otherPlayer);
          }
        }
        if(obj.type === "collision"){
          if(obj.name === metadata.name){
            this.player.setPosition(Phaser.Math.Between(800, 1300),Phaser.Math.Between(800, 1600));
            const str = JSON.stringify({
              message: `${metadata.name} died!`,
              from: coinbase,
              timestamp: (new Date()).getTime(),
              metadata: metadata,
              type: "message"
            });

            const objPlayer = {
              player: this.player,
              metadata: metadata
            };
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
            const msgSend = await WakuMessage.fromUtf8String(str, contentTopicChat)
            await this.room.relay.send(msgSend);
          }
        }
      } catch(err){
        console.log(err)
      }
    }, [contentTopic]);




    this.physics.add.collider(this.player,this.otherPlayers,async (player, enemy) => {
      if(enemy.body.touching.up){
        const msg = JSON.stringify({
          name: enemy.name,
          type: "collision"
        });
        enemy.destroy();
        const msgSend = await WakuMessage.fromUtf8String(msg, contentTopic)
        await room.relay.send(msgSend);
      } else if(player.body.touching.up) {
        const msg = JSON.stringify({
          name: player.name,
          type: "collision"
        });
        const msgSend = await WakuMessage.fromUtf8String(msg, contentTopic)
        await room.relay.send(msgSend);
      } else {
        player.setVelocityX(0);
        player.setVelocityY(0);

        enemy.setVelocityX(0);
        enemy.setVelocityX(0);
      }
    },null, this);

    this.physics.add.collider(this.player,worldLayer);
    this.physics.add.collider(this.otherPlayers,worldLayer);

    let msg = JSON.stringify({
      message: `${metadata.name} joined HashIsland!`,
      from: coinbase,
      timestamp: (new Date()).getTime(),
      metadata: metadata,
      type: "message"
    });

    WakuMessage.fromUtf8String(msg, contentTopicChat)
    .then(msgSend => {
      room.relay.send(msgSend);
    })

    msg = JSON.stringify({
      metadata: metadata,
      player: this.player,
      from: coinbase,
      type: "movement"
    });

    WakuMessage.fromUtf8String(msg, contentTopic)
    .then(msgSend => {
      room.relay.send(msgSend);
    })

  },

  hitEnemy: async function(player, enemy){
      if(enemy.body.touching.up){
        const msg = JSON.stringify({
          name: enemy.name,
          type: "collision"
        });
        enemy.destroy();
        const msgSend = await WakuMessage.fromUtf8String(msg, contentTopic)
        await this.room.relay.send(msgSend);
      } else if(player.body.touching.up) {
        const msg = JSON.stringify({
          name: player.name,
          type: "collision"
        });
        const msgSend = await WakuMessage.fromUtf8String(msg, contentTopic)
        await this.room.relay.send(msgSend);
      } else {
        player.setVelocityX(0);
        player.setVelocityY(0);

        enemy.setVelocityX(0);
        enemy.setVelocityX(0);
      }
  },


  update: function(){

    //this.player.setVelocity(0);
    const msg = JSON.stringify({
      metadata: metadata,
      player: this.player,
      from: coinbase,
      type: "movement"
    });
    if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown){
      WakuMessage.fromUtf8String(msg, contentTopic)
      .then(msgSend => {
        room.relay.send(msgSend);
      });
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

export default function HashOperation () {
  const gameRef = useRef(null);
  const { state } = useAppContext();
  const [waku,setWaku] = useState();
  const [msgs,setMsgs] = useState([]);
  const [metadataPlayer,setMetadataPlayer] = useState();
  // Call `setInitialize` when you want to initialize your game! :)
  const [initialize, setInitialize] = useState(false);
  const [msg,setMsg] = useState();
  const destroy = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
    }
    setInitialize(false)
  }



 const post =  useCallback(async () => {
    const inputMessage = document.getElementById('input_message');
    const msgWaku = JSON.stringify({
      message: msg,
      from: state.coinbase,
      timestamp: (new Date()).getTime(),
      metadata: metadataPlayer,
      type: "message"
    });
    const msgSend = await WakuMessage.fromUtf8String(msgWaku, contentTopicChat);

    await waku.relay.send(msgSend);
    const newMsgs = msgs;
    newMsgs.unshift(JSON.parse(msgWaku));
    setMsgs(newMsgs);
    inputMessage.value = '';
    inputMessage.innerText = '';
    setMsg('');

  },[waku,WakuMessage,state.coinbase,metadataPlayer,document.getElementById('input_message'),msg,msgs]);

  const setMetadata = (mt) => {
      metadata = mt;
      coinbase = state.coinbase;
      setMetadataPlayer(mt);
      setInitialize(true);
  }

  useMemo(() => {
    metadatas = state.nfts.map(str => {
      const obj = JSON.parse(str);
      return(obj.metadata);
    });
  },[state.nfts.length > 0]);

  useMemo(async () => {
    if(state.hashavatars && !waku){
      const newWaku = await Waku.create({ bootstrap: true });
      await newWaku.waitForConnectedPeer();

      setWaku(newWaku)
      room = newWaku;
      newWaku.relay.addObserver(async (msgWaku) => {
        try{
          const obj = JSON.parse(msgWaku.payloadAsUtf8);
          if(obj.type === "message"){
            const newMsgs = msgs;
            newMsgs.unshift(obj);
            setMsgs(newMsgs);
          }
        } catch(err){
          console.log(err)
        }
      }, [contentTopicChat]);

    }

  },[state.hashavatars,waku,msgs]);

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
              waku ?
              <>
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
              <p>Loading js-waku ...</p>
              </>
            }
            </Col>
            <Col md={8}>
              {
                waku && <IonPhaser ref={gameRef} game={game} initialize={initialize} />
              }
            </Col>
          </Row>
        </Container> :
        <>
        <h4>Select a HashAvatar</h4>
        <p>HashOperation game (beta) - HashIsland is under war! Kill all others players by touching their head! Survive!</p>
        <p><small><Link href="https://phaser.io/" external>Done with phaser <IconLink /></Link></small></p>
        <p><small><Link href="https://merchant-shade.itch.io/16x16-mini-world-sprites" external>Tilesets by Shade <IconLink /></Link></small></p>
        <p><small><Link href="https://github.com/status-im/js-waku" external>Powered with js-waku<IconLink /></Link></small></p>

        {
          state.loadingNFTs && state.nfts && state.totalSupply &&
          <center>
          <p>Loading all HashAvatars ...</p>
          <ProgressBar
            value={state.nfts.length/state.totalSupply}
          />
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
