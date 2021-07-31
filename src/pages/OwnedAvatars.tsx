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
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Avatar
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'
import LazyLoad from 'react-lazyload';



class AllAvatars extends React.Component {

  state = {
    myHashAvatars: [],
    loading: true
  }
  constructor(props){
    super(props);
    this.checkEvents = this.checkEvents.bind(this);
  }
  componentDidMount = async () => {

    setInterval(async () => {
      if(this.state.myHashAvatars !== this.props.savedBlobs){
        await this.checkEvents();
      }
    },1000)

  }

  checkEvents = async () => {

      this.props.savedBlobs.map(async str => {
        const obj = JSON.parse(str);
        if(this.props.coinbase){
          const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,obj.returnValues._id).call();
          if(balance > 0 && !this.state.myHashAvatars.includes(JSON.stringify(obj))){
            this.state.myHashAvatars.push(JSON.stringify(obj));
          }
        }
      });
      this.state.loading = false;
      this.forceUpdate();

  }
  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            <Heading>HashAvatars you own</Heading>
            </Box>
            <Box>
            {
              this.props.loadingAvatars &&
              (
                <>
                <Spinner size="xl" />
                <p><small>Loading all HashAvatars</small></p>
                </>
              )
            }
            {

              !this.props.coinbase ?
              (
                <Center>
                 <VStack spacing={4}>
                  <p>Connect your wallet</p>
                  <Avatar
                    size={'xl'}
                    src={
                      'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                    }
                  />
                  </VStack>
                </Center>
              ) :
              (
                this.state.myHashAvatars.length === 0 && !this.props.loadingAvatars ?

                (
                  <Center>
                   <VStack spacing={4}>
                    <p>No HashAvatars here</p>
                    <Avatar
                      size={'xl'}
                      src={
                        'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                      }
                    />
                    </VStack>
                  </Center>
                ) :
                (
                  <SimpleGrid
                    columns={{ sm: 1, md: 6 }}
                    spacing="40px"
                    mb="20"
                    justifyContent="center"
                  >
                  {
                    this.state.myHashAvatars?.map((string) => {
                      const blob = JSON.parse(string);
                      return(
                        <LazyLoad>
                        <Box
                          rounded="2xl"
                          p="5"
                          borderWidth="1px"
                          _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                        >
                          <Popover>
                            <PopoverTrigger>
                            <LinkBox
                              // h="200"
                              role="group"
                              as={Link}
                            >
                              <Text
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <LinkOverlay
                                  style={{fontWeight: 600 }}
                                  href={blob.url}
                                >
                                  {blob.metadata.name}
                                </LinkOverlay>
                              </Text>
                              <Divider mt="4" />
                              <Center>
                                <Avatar src={blob.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="2xl"/>
                              </Center>

                            </LinkBox>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverHeader>{blob.metadata.name}</PopoverHeader>
                              <PopoverBody>
                              <p><small>Token ID: {blob.returnValues._id}</small></p>
                              <p><small><Link href={`https://epor.io/tokens/${this.props.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                              <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.props.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Box>
                        </LazyLoad>
                      )
                    })
                  }
                  </SimpleGrid>
                )




              )

            }

            </Box>
          </VStack>
        </Box>


    )
  }
}

export default AllAvatars
