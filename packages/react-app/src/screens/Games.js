import React,{useState} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { Button } from '@aragon/ui';

import HashAtack from './games/HashAtack'
import HashVille from './games/HashVilleUnderHashAtack'
import HashOperation from './games/HashOperation1'

function GamesPage() {

  const [play,setPlay] = useState();

  const games = [
    {
      component: <HashAtack />,
      name: "HashAttack",
      description: "Avoid being touched by HashAvatars icon!",
      image: "https://ipfs.io/ipfs/QmbKJ5wbYhio5h8NdGD6nyXmpJ7NFJqyqMAEbq8YwF8Kkk"
    },
    {
      component: <HashVille/>,
      name: "HashVille under HashAttack",
      description: "Protect yourself! HashVille is under attack!",
      image: "https://ipfs.io/ipfs/QmUs9rX2FsYUML9PCWMExJZfgcTPiXGV3FpArrTxd1Yf8i"
    },
    {
      component: <HashOperation/>,
      name: "HashOperation",
      description: "HashIsland is under war! Kill all others players by touching their head! Survive!",
      image: "https://ipfs.io/ipfs/QmbUD9ekE1CBvZZsSC3PvrRE6oxgkrVfbHyNx7GaGCuX6o"
    },
    /*
    {
      component: <SnowflakesInvasion {...this.props} />,
      name: "SnowflakesInvasion",
      description: "",
      image: "https://ipfs.io/ipfs/QmbUD9ekE1CBvZZsSC3PvrRE6oxgkrVfbHyNx7GaGCuX6o"
    }
    */
  ]

  return(

      <>
      {
        (
          play ?
          (
            <>
            {play}
            </>
          ) :
          (
            <div>
              <div>
                <h4>HashAvatars Games</h4>
              </div>
              <Container>

              {
                (
                  !play &&
                  (
                    <Row
                      columns={{ sm: 1, md: 5 }}
                      spacing="40px"
                      mb="20"
                      justifyContent="center"
                    >
                    {
                      games.map((game) => {

                        return(
                          <Col>
                            <center>
                            <div><b>{game.name}</b></div>
                            <hr />
                            <div><img src={game.image} style={{width: '150px',height: '150px',borderRadius: '50%'}} alt=""/></div>
                            <hr />
                            <div><Button onClick={() => {setPlay(game.component)}} size="small" mode="strong">Play</Button></div>


                            <div>{game.description}</div>
                            </center>
                          </Col>
                        )
                      })
                    }
                    </Row>
                  )
                )
              }

              </Container>
            </div>
          )
        )
      }

      </>


  )

}

export default GamesPage;
