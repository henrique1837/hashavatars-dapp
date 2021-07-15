import * as React from "react";
import {
  Box,
  Heading,
  VStack,
  LinkBox,
  SimpleGrid,
  Link,
  List,
  ListItem,
  Avatar,
  Center
} from "@chakra-ui/react";



class Collections extends React.Component {

  state = {

  }
  
  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
              <Heading>HashAvatars collections</Heading>
            </Box>
            <Box>
              <List spacing={6} style={{textAlign: 'left'}}>
                <ListItem>
                  <LinkBox
                    _hover={{ boxShadow: '2xl' }}
                    role="group"
                    as={Link}
                    target="_blank"
                  >
                    <SimpleGrid
                      columns={{ sm: 1, md: 2 }}
                      spacing="40px"
                      mb="20"
                      justifyContent="left"
                    >
                      <Center>
                        <Avatar src='https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF' />
                      </Center>
                      <Center>
                        <Heading as="h4" size="md">HashAvatars</Heading>
                      </Center>
                    </SimpleGrid>
                  </LinkBox>
                </ListItem>
                <ListItem>
                  <LinkBox
                    _hover={{ boxShadow: '2xl' }}
                    role="group"
                    as={Link}
                    target="_blank"
                    href="https://snowflakeshash.com"
                  >
                    <SimpleGrid
                      columns={{ sm: 1, md: 2 }}
                      spacing="40px"
                      mb="20"
                      justifyContent="left"
                    >
                      <Center>
                        <Avatar src='https://ipfs.io/ipfs/QmSkVuNUPH86Xbsv6N9z7SJgL7sEWfRc2rrxeejqRjUiiN' />
                      </Center>
                      <Center>
                        <Heading as="h4" size="md">Snowflakes Hash</Heading>
                      </Center>
                    </SimpleGrid>
                  </LinkBox>
                </ListItem>
              </List>
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default Collections
