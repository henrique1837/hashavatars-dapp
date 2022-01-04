import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink } from '@aragon/ui';

import { useAppContext } from '../../hooks/useAppState';

let metadata;
let metadatas;
let totalBullets;
let enemiesKilled;
const MainScene = {
  init: function(){
    //this.cameras.main.setBackgroundColor('#24252A')
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
      //this.load.baseURL = 'http://examples.phaser.io/assets/';
      this.load.image("tiles", "https://ipfs.io/ipfs/QmQMdg8j9ssWbRxjKWb8JBW3PLAPvQN5cxZEP8DmhY1jrj");
      this.load.tilemapTiledJSON("map", "https://ipfs.io/ipfs/QmeSesTyeikbLnVjQnsgvhfxJrQz6taYLZxkDsbve7ntej");
      this.load.image("player", metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      this.load.image('bomb', "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
      this.load.image('bullet', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));

      for(let i = 0;i<metadatas.length;i++){
        this.load.image('ha'+i, JSON.parse(metadatas[i]).metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      }

  },
  create: function(){

    totalBullets = 0;
    enemiesKilled = 0;

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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.bombs = this.physics.add.group();
    this.ha = this.physics.add.group();
    this.bullets = this.physics.add.group();


    this.physics.add.collider(this.bombs,worldLayer);
    this.physics.add.collider(this.player, this.bombs, (player, bomb) => {
        this.physics.pause();

        this.player.setTint(0xff0000);
        this.scene.restart();
    }, null, this);
    this.physics.add.collider(this.bullets, this.bombs, (bullet, bomb) => {
        bullet.disableBody(true,true);
        bomb.disableBody(true,true);
        totalBullets -= 1;
        enemiesKilled += 1;
    }, null, this);

    this.physics.add.collider(this.bombs,this.bombs);
    this.physics.add.collider(this.ha, worldLayer);
    this.physics.add.collider(this.bullets, worldLayer,(bullet) => {
        bullet.disableBody(true,true);
        totalBullets -= 1;
    }, null, this);
    this.physics.add.collider(this.ha,this.bullets);
    this.physics.add.collider(this.player,this.bullets);
    this.physics.add.collider(this.bullets, this.bullets);

    this.physics.add.collider(this.bombs,this.ha);
    this.physics.add.collider(this.player,this.ha);
    this.physics.add.collider(this.ha,this.ha);

    for(let i = 0;i<metadatas.length;i++){

      const x = Phaser.Math.Between(100, 1000);
      const y = Phaser.Math.Between(100, 1000);
      const ha = this.ha.create(x,y,"ha"+i);
      ha.setCollideWorldBounds(true);
      ha.setBounce(1);
      ha.setScale(0.15);
      ha.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    }

  },
  specialFire : function(){
    for(let i = 0;i<200;i++){
      const bullet = this.bullets.create(this.player.x,this.player.y,"bullet");
      bullet.setCollideWorldBounds(true);
      bullet.setBounce(1);
      bullet.setScale(0.05);
      bullet.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    }
  },

  update: function(){
    this.player.setVelocity(0);
    if (this.cursors.left.isDown){
      this.player.setVelocityX(-280);
    }

    if (this.cursors.right.isDown){
      this.player.setVelocityX(280);
    }
    if (this.cursors.up.isDown){
      this.player.setVelocityY(-280);
    }
    if (this.cursors.down.isDown){
      this.player.setVelocityY(280);
    }
    if (this.cursors.space.isDown){
      if(totalBullets >= 10){
        return;
      }
      console.log(this.player)
      const bullet = this.bullets.create(this.player.x,this.player.y,"bullet");
      bullet.setCollideWorldBounds(true);
      bullet.setBounce(1);
      bullet.setScale(0.05);
      bullet.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
      totalBullets += 1;
    }

    if(Date.now() % 213 === 0){
      const x = Phaser.Math.Between(100, 1000);
      const y = Phaser.Math.Between(100, 1000);

      const bomb = this.bombs.create(x, y, 'bomb');
      bomb.scale = 0.15
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
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

export default function HashAtack () {
  const gameRef = useRef(null);
  const { state } = useAppContext();

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
      metadatas = state.myOwnedNfts.filter(string => {
        const item = JSON.parse(string);
        if(item.metadata.name !== mt.name){
          return(item);
        }
      });
      setInitialize(true);
  }
  return (
    <center>
      {
        initialize ?
        <Container>
        <IonPhaser ref={gameRef} game={game} initialize={initialize} />
        </Container> :
        <>
        <h4>Select a HashAvatar</h4>
        <p>HashVille under HashAttack game -Protect yourself! HashVille is under attack!</p>
        <p><small><Link href="https://phaser.io/" external>Done with phaser <IconLink /></Link></small></p>
        <p><small><Link href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6" external>Based on Modular Game Worlds in Phaser3 <IconLink /></Link></small></p>

        {
          state.loadingNFTs && state.nfts && state.totalSupply &&
          <center>
          <p>Loading all HashAvatars ...</p>
          <p><small>Wait if you want that all yours HashAvatars join the game</small></p>
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
