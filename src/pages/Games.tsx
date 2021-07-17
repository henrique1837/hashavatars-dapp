import * as React from "react";
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
  Avatar
} from "@chakra-ui/react"

import HashAtack from '../components/games/HashAtack';
import HashVille from '../components/games/HashVilleUnderHashAtack';
import HashOperation from '../components/games/HashOperation';


class GamesPage extends React.Component {

  state = {
    games: [
      {
        component: <HashAtack {...this.props} />,
        name: "HashAtack",
        description: "Avoid being touched by HashAvatars icon!",
        image: "https://ipfs.io/ipfs/QmbKJ5wbYhio5h8NdGD6nyXmpJ7NFJqyqMAEbq8YwF8Kkk"
      },
      {
        component: <HashVille {...this.props} />,
        name: "HashVille under HashAtack",
        description: "Protect yourself! HashVille is under atack!",
        image: "https://ipfs.io/ipfs/QmUs9rX2FsYUML9PCWMExJZfgcTPiXGV3FpArrTxd1Yf8i"
      },
      {
        component: <HashOperation {...this.props} />,
        name: "HashOperation",
        description: "HashIsland is under war! Kill all others players by touching their head! Survive!",
        image: "https://ipfs.io/ipfs/QmbUD9ekE1CBvZZsSC3PvrRE6oxgkrVfbHyNx7GaGCuX6o"
      }
    ],
    play: null
  }

  componentDidMount = async () => {

  }

  play = (game) => {
    this.setState({
      play: game
    })
  }


  render(){
    return(

        <Box>
        {
          (
            this.state.play ?
            (
              <>
              {this.state.play.component}
              </>
            ) :
            (
              <VStack spacing={12}>
                <Box>
                  <Heading>HashAvatars Games</Heading>
                </Box>
                <Box>

                {
                  (
                    !this.state.play &&
                    (
                      <SimpleGrid
                        columns={{ sm: 1, md: 5 }}
                        spacing="40px"
                        mb="20"
                        justifyContent="center"
                      >
                      {
                        this.state.games.map((game) => {

                          return(
                            <Box
                              rounded="2xl"
                              p="5"
                              borderWidth="1px"
                              _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                            >

                                <LinkBox
                                  // h="200"
                                  role="group"
                                  as={Link}
                                  onClick={() => {this.play(game)}}
                                >

                                  <Center>
                                    <Text
                                      fontSize="sm"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <LinkOverlay
                                        style={{fontWeight: 600 }}
                                        onClick={() => {this.play(game)}}
                                      >
                                        {game.name}
                                      </LinkOverlay>
                                    </Text>
                                  </Center>
                                  <Divider mt="4" />
                                  <Center>
                                      <Avatar
                                        size="2xl"
                                        src={game.image}
                                      />
                                  </Center>
                                  <Divider mt="4" />
                                  <Text>
                                    {game.description}
                                  </Text>
                                </LinkBox>
                            </Box>
                          )
                        })
                      }
                      </SimpleGrid>
                    )
                  )
                }

                </Box>
              </VStack>
            )
          )
        }

        </Box>


    )
  }
}

export default GamesPage;
