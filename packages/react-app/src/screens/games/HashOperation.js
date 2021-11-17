import React, { useState, useEffect,useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink } from '@aragon/ui';
import Room from 'ipfs-pubsub-room';

import { useAppContext } from '../../hooks/useAppState';
import useIpfs from '../../hooks/useIPFS';

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
    this.load.image('ship', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    this.load.image("tiles", "https://ipfs.io/ipfs/QmVpCeH52ya9gWdGnsa1u6z7kDLTPosUoPxhuYkwfqgKqi");
    //this.load.image("background", "https://ipfs.io/ipfs/QmQuEkDthgq6Hd5XWpUYZQ3oEoopHbt3X6EH2EwapSGxUA");

    this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmNhhHG84xkV4h8s8vBw6bQHncDwzyvcJZ8eAUqgmKMi63");

    for(let i = 0;i<metadatas.length;i++){
      this.load.image(metadatas[i].metadata.name, metadatas[i].metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
    }
  },
  addOtherPlayers: function(playerInfo){
    const otherPlayer = this.physics.add.sprite(0, 0,  playerInfo.name).setScale(0.05);
    otherPlayer.setBounce(0.2).setCollideWorldBounds(true);
    otherPlayer.name = playerInfo.name
    this.otherPlayers.add(otherPlayer);
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

  },

  hitEnemy: async function(player, enemy){
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

  playerMoved: async function(){
    const msg = JSON.stringify({
      metadata: metadata,
      player: this.player,
      from: coinbase,
      type: "movement"
    });
    await this.room.broadcast(msg);
  },
  update: function(){

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

const game = {
  width: "60%",
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
  const { ipfs } = useIpfs();

  // Call `setInitialize` when you want to initialize your game! :)
  const [initialize, setInitialize] = useState(false)
  const destroy = () => {
    if (gameRef.current) {
      gameRef.current.destroy()
    }
    setInitialize(false)
  }
  const setMetadata = (mt) => {
      metadata = mt;
      coinbase = state.coinbase;
      setInitialize(true)
  }

  useMemo(() => {
    metadatas = state.nfts.map(str => {
      const obj = JSON.parse(str);
      return(obj.metadata);
    });
  },[state.nfts])
  useMemo(() => {
    if(state.hashavatars && ipfs){
      room = new Room(ipfs, 'hashavatars-dapp-hashoperation-game-'+state.hashavatars.address)
      /*
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
      */
    }

  },[state.hashavatars,ipfs]);
  return (
    <center>
      {
        initialize ?
        <Container>
          <IonPhaser ref={gameRef} game={game} initialize={initialize} />
        </Container> :
        <>
        <h4>Select a HashAvatar</h4>
        <p>HashOperation game (beta) - HashIsland is under war! Kill all others players by touching their head! Survive!</p>
        <p><small><Link href="https://phaser.io/" external>Done with phaser <IconLink /></Link></small></p>
        <p><small><Link href="https://merchant-shade.itch.io/16x16-mini-world-sprites" external>Tilesets by Shade <IconLink /></Link></small></p>
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
