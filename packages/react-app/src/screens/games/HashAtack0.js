import React, { useRef, useState } from 'react'
import * as Phaser from 'phaser'
import { Project, Scene3D, PhysicsLoader } from 'enable3d'
import { IonPhaser } from '@ion-phaser/react'
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button,ProgressBar,Link,IconLink } from '@aragon/ui';

import { useAppContext } from '../../hooks/useAppState';
let metadata;

class MainScene extends Scene3D {
  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    this.accessThirdDimension()
  }

  create() {
    // creates a nice scene
    this.third.warpSpeed()

    // adds a box
    this.third.add.box({ x: 1, y: 2 })

    // adds a box with physics
    this.third.physics.add.box({ x: -1, y: 2 })

    // throws some random object on the scene
    this.third.haveSomeFun()
  }

  update() {}
}
const game = {
  width: "60%",
  height: "60%",
  transparent: true,
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [MainScene]
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
