import React, { useRef, useState } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink } from '@aragon/ui';

import { useAppContext } from '../../hooks/useAppState';
let metadata;

const MainScene = {

    init: function() {
      this.cameras.main.setBackgroundColor('#24252A')
    },
    preload: function() {
      this.load.image('bomb', "https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
      this.load.image('clone',metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"))
      this.load.image('player', metadata.image.replace("ipfs://","https://ipfs.io/ipfs/"));
      this.load.image('platform', 'https://ipfs.io/ipfs/bafkreiaz6syhyt45764hiiqm75tkkuwvfczzqgzcl6bugkjfh6sru4meyy' );

    },
    create: function() {
      this.totalMp = 0;
      this.cursors = this.input.keyboard.createCursorKeys();
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
      this.physics.add.collider(this.player, this.bombs,  function(player, bomb){
          this.physics.pause();

          this.player.setTint(0xff0000);
          this.scene.restart();
      }, null, this);
      this.physics.add.collider(this.clones, this.bombs, function(clone, bomb){
          clone.disableBody(true,true);
          bomb.disableBody(true,true);
          this.totalMp -= 1;
      }, null, this);
    },
    update: function() {
      this.helloWorld.angle += 1;
      this.player.setVelocityX(0);
      if (this.cursors.left.isDown){
        this.player.setVelocityX(-280);
      }

      if (this.cursors.right.isDown){
        this.player.setVelocityX(280);
      }
      if (this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(-480);
      }
      if(Date.now() % 23 === 0){
        if(this.totalMp < 5){
          const x = Phaser.Math.Between(this.player.x-10, this.player.x+10)

          const bomb = this.clones.create(x, this.player.y-10, 'clone');
          bomb.setBounce(1);
          bomb.scale = 0.15
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
          this.totalMp += 1;
        }
      }

      if(Date.now() % 21 === 0){
        const x = Phaser.Math.Between(400, 3100);
        const bomb = this.bombs.create(x, 16, 'bomb');
        bomb.scale = 0.15
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));      }


    },

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
      gravity: { y: 200,x:0 },
      debug: false
    }
  },
  scene: MainScene
}

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
      setInitialize(true)
  }
  return (
    <center>
      {
        initialize ?
        <>
        <IonPhaser ref={gameRef} game={game} initialize={initialize} />
        </> :
        <>
        <h4>Select a HashAvatar</h4>
        <p>HashAttack game - avoid being touched by HashAvatars icon, use your clones to help!</p>
        <p><small><Link href="https://phaser.io/" external>Done with phaser <IconLink /></Link></small></p>
        <p><small><Link href="https://phaser.io/tutorials/making-your-first-phaser-3-game/part1" external>Based on First Game Phaser3 tutorial <IconLink /></Link></small></p>

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
