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
  Avatar,
  Spinner
} from "@chakra-ui/react"

import HashAtack from '../components/games/HashAtack';
import HashVille from '../components/games/HashVilleUnderHashAtack';
import HashOperation from '../components/games/HashOperation';
import SnowflakesInvasion from '../components/games/SnowflakeInvasion';


class GamesPage extends React.Component {

  state = {
    games: [
      {
        component: <HashAtack {...this.props} />,
        name: "HashAttack",
        description: "Avoid being touched by HashAvatars icon!",
        image: "https://ipfs.io/ipfs/QmbKJ5wbYhio5h8NdGD6nyXmpJ7NFJqyqMAEbq8YwF8Kkk"
      },
      {
        component: <HashVille {...this.props} />,
        name: "HashVille under HashAttack",
        description: "Protect yourself! HashVille is under attack!",
        image: "https://ipfs.io/ipfs/QmUs9rX2FsYUML9PCWMExJZfgcTPiXGV3FpArrTxd1Yf8i"
      },
      {
        component: <HashOperation {...this.props} />,
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
    ],
    play: null
  }

  componentDidMount = async () => {
    if(this.props.netId === 4){
      this.state.games.push(
        {
          component: <SnowflakesInvasion {...this.props} />,
          name: "SnowflakesInvasion",
          description: "Defend HashNation from Snowflakes Invasion!",
          image: "https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu"
        }
      )
      this.forceUpdate();
    }
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
              {this.state.play}
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
                          if(game.name === "SnowflakesInvasion" && this.props.loadingAvatars){
                            return(
                              <Box
                                rounded="2xl"
                                p="5"
                                borderWidth="1px"
                                _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                              >
                              <VStack spacing={2}>
                                <small>Loading SnowflakesInvasion</small>
                                <Divider mt="4" />
                                <Center>
                                    <Avatar
                                      size="2xl"
                                      src={game.image}
                                    />
                                </Center>
                                <Divider mt="4" />
                                <Spinner size="xl"/>
                                <Text fontSize="md">Atack is coming!</Text>
                              </VStack>
                              </Box>
                            )
                          }
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
                                  onClick={() => {!this.props.loadingAvatars ? this.play(<SnowflakesInvasion {...this.props} />) : this.play(game.component)}}
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
                                  <Text fontSize="md">
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
