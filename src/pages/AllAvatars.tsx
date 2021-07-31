import * as React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Divider,
  Link,
  Image,
  Center,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Select,
  Tooltip,
  Avatar as Av
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'

import makeBlockie from 'ethereum-blockies-base64';

import Avatar from 'avataaars';
import LazyLoad from 'react-lazyload';


class OwnedAvatars extends React.Component {

  state = {
    savedBlobs: [],
    likes: [],
    loadingLikes: [],
    filterBy: null,
    page: 6
  }


  componentDidMount = () => {
    setInterval(async () => {
      if(this.props.likes !== this.state.likes){
        this.setState({
          likes: this.props.likes
        })
      }
      if(document.body.scrollHeight <= window.scrollY + 800 ){
        let page = this.state.page + 6
        this.setState({
          loadingHashAvatarsMsg: <Spinner size="xl" />
        })
        if(!this.props.loadingAvatars){
          if(page > this.props.savedBlobs.length){
            page = this.props.savedBlobs.length
            this.setState({
              loadingHashAvatarsMsg: ''
            })
          }
          this.setState({
            page: page
          })
        }
      }


    } ,1000)
  }
  like = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.props.tokenLikes.methods.like(id).send({
        from: this.props.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }

  unlike = async(id) => {
    try{
      this.state.loadingLikes[id] =  true
      await this.forceUpdate();
      await this.props.tokenLikes.methods.unlike(id).send({
        from: this.props.coinbase,
        gasPrice: 1000000000
      });
    } catch(err){
      console.log(err)
    }
    this.state.loadingLikes[id] =  false
    await this.forceUpdate();
  }

  filter = (creator) => {
    if(creator === null){
      this.setState({
        filterBy: null,
        page: 6
      })
      return;
    }
    const creatorProfile = JSON.parse(
      this.props.creators.filter(str => {
        const obj = JSON.parse(str);
        if(obj.address === creator){
          return(obj)
        }
      })
    )
    this.setState({
      filterBy: creatorProfile,
      loadingSnowflakesMsg: ''
    })
  }

  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            {
              !this.state.filterBy ?
              (
                <>
                <VStack spacing={2}>
                <Heading>Creators</Heading>
                <p><small>Total of {this.props.creators.length} HashAvatars creators</small></p>
                <Divider />
                <HStack spacing={2} style={{overflowX: 'auto',maxWidth: document.body.clientWidth - document.body.clientWidth*0.2}} id='hstack_profiles'>
                {
                  this.props.creators?.map((string) => {
                    const obj = JSON.parse(string);
                    return(
                      <LazyLoad>
                      <Box>
                        <Tooltip label={obj.profile?.description ? (obj.profile.description) : (obj.address)} aria-label={obj.creator}>
                          <LinkBox as={Link} onClick={() => {this.filter(obj.address)}}>
                            <VStack spacing={3}>
                              <Av src={
                                  obj.profile?.image ?
                                  (
                                    obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")
                                  ) :
                                  (
                                    makeBlockie(obj.address)
                                  )
                              } size='xs' alt="" />
                              <small  style={{
                                whiteSpace: "nowrap",
                                width: "100px",                   /* IE6 needs any width */
                                overflow: "hidden",              /* "overflow" value must be different from  visible"*/
                                oTextOverflow: "ellipsis",    /* Opera < 11*/
                                textOverflow:   "ellipsis",    /* IE, Safari (WebKit), Opera >= 11, FF > 6 */
                              }}>{obj.profile?.name ? (obj.profile.name) : (obj.address)}</small>
                            </VStack>
                          </LinkBox>
                        </Tooltip>
                      </Box>
                      </LazyLoad>
                    )
                  })
                }
                </HStack>
                </VStack>
                </>
              ) :
              (
                this.state.filterBy &&
                (
                  <>
                  <VStack spacing={2}>
                  <Heading>Creator Profile</Heading>
                  <HStack spacing={2} style={{maxWidth:  document.body.clientWidth -  document.body.clientWidth*0.2}}>
                  <Box>
                    <LinkBox as={Link} href={`https://3box.io/${this.state.filterBy.address}`} isExternal >
                      <VStack spacing={3}>
                        <Av src={
                            this.state.filterBy.profile?.image ?
                            (
                              this.state.filterBy.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")
                            ) :
                            (
                              makeBlockie(this.state.filterBy.address)
                            )
                        } size='2xl' alt="" />
                        <Text><b>{this.state.filterBy.profile?.name ? (this.state.filterBy.profile.name) : (this.state.filterBy.address)}</b></Text>
                        <Text><small>{this.state.filterBy.profile?.description}</small></Text>
                      </VStack>
                    </LinkBox>
                    <Box>
                      <Button onClick={() => {this.filter(null)}}>All creators</Button>
                    </Box>
                  </Box>
                  </HStack>
                  </VStack>
                  </>
                )

              )
            }
            </Box>
            <Box>
              <Heading>All HashAvatars generated</Heading>
              <p><small>Total of {this.props.savedBlobs.length} HashAvatars</small></p>
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
              (
                this.props.savedBlobs.length === 0 && !this.props.loadingAvatars ?
                (
                  <Center>
                   <VStack spacing={4}>
                    <p>No HashAvatars here</p>
                    <Av
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
                    this.props.savedBlobs?.map((string) => {
                      const blob = JSON.parse(string);
                      if(this.state.filterBy && blob.creator !== this.state.filterBy.address){
                        return
                      }
                      /*
                      if(this.props.loadingAvatars && !this.state.filterBy){
                        return
                      }
                      /*
                      if(!this.state.filterBy && blob.returnValues._id <= this.props.savedBlobs.length - this.state.page){
                        return
                      }
                      /*
                      if(!(blob.returnValues._id >= this.state.page && blob.returnValues._id <= 10*this.state.page)){
                        return;
                      }
                      */
                      return(
                        <LazyLoad>
                        <Box
                          rounded="2xl"
                          p="5"
                          borderWidth="1px"
                          _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                          style={{wordBreak: 'break-word'}}
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
                                <Av src={blob.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="2xl"/>
                              </Center>

                            </LinkBox>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverHeader>{blob.metadata.name}</PopoverHeader>
                              <PopoverBody>
                              <p><small>Token ID: {blob.returnValues._id}</small></p>
                              <p style={{
                                whiteSpace: "nowrap",
                                width: "100%",                   /* IE6 needs any width */
                                overflow: "hidden",              /* "overflow" value must be different from  visible"*/
                                oTextOverflow: "ellipsis",    /* Opera < 11*/
                                textOverflow:   "ellipsis",    /* IE, Safari (WebKit), Opera >= 11, FF > 6 */
                              }}>
                                <small>
                                  Creator:
                                  <Tooltip label={blob.profile?.description ? (blob.profile.description) : (blob.creator)} aria-label={blob.creator}>
                                    <Link href={`https://3box.io/${blob.creator}`} isExternal>
                                      <Av src={
                                          blob.profile?.image ?
                                          (
                                            blob.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")
                                          ) :
                                          (
                                            makeBlockie(blob.creator)
                                          )
                                      } size='sm' alt="" />{' '}{blob.profile?.name ? (blob.profile.name) : (blob.creator)}
                                    </Link>
                                  </Tooltip>
                                </small>
                              </p>
                              <p><small><Link href={`https://epor.io/tokens/${this.props.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                              <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.props.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                          <Divider mt="4" />
                          <Center>
                            <Text>
                              <p>Likes: {this.state.likes[blob.returnValues._id]?.likes}</p>
                            </Text>
                          </Center>
                          <Center>

                          {
                            (
                              this.props.coinbase &&
                              (
                                !this.state.loadingLikes[blob.returnValues._id] ?
                                (
                                  !this.state.likes[blob.returnValues._id]?.liked ?
                                  (
                                    <Button
                                      variant="heavy"
                                      leftIcon={<Image boxSize="25px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAC3UlEQVRoge2ZPWgUQRTHf2f0NBYGJTYSxELwExKCwYA2KgiKpFHsLC1EMViIFiIGK7HRRkUQJJigCGJhYaEoKIqNBDvNKRJN/Iz4hacYE4t3x769u72dm7nb2eJ+sDDsvPvP/92+/ZgZaNIk9cwBTgHvgXfAHWCHV0c1chqYqXAM+DRlSjuQp3ICM8ABf9bM2ENg9gnQAVxX574Bbd7cGTBEYPZo4VwWeKnO7/VjLZ4W4DOB0S7V16/OX03emhm9BCbHgYzq61R9z10GmeXy4xi2qfZtxGyRV6q9pIEenHhK8C/vKunLqr58wr6M6CMw+JvyJ02H6p9M1lo8C4EJAoMXKsRsVf0jyVkz4zKBuQkkoVIOqZjB5KzFs53wm7YvIu6GitmfjLV42oAxAmNXIuJmA19V3IpE3BlwicDUR2BxRNwGFfc6GWvxbAGmCYztrBI7oOIuNtpYa2HAHDBFuL6jjmsxmo+r/PYv8BYYRq6Us/mHhqZNSqfI9xr0ziH3jBX6Upseuw10TyIvN1PN87YJ5JTIYWRqWAk9mCstwFrgVonuRhsxXfPZKnH1TKBIBripdIdtREyNNSIBgG6lO2Yj4DuBBUr3V1RQI+cDrixV7S9RQWlOYL1qR36xpjmBzap9z0bA9z0wrnS7bQR8JrBKaU5SpVLSWkK6fO4jH4oVSWsCm1Tbqv7BXwllgE9Kc42tkK8EupTeB8ILYmWksYR0/d8l5o9JYwJ1qX/wU0LzgR9Kb7mLmI8E9imtZ65iJvMBvcb5D1jkMN4ywsvx/Q5aQHhGdoTyJLLIpoW+AtPIcvkgsn3UQ/RMTrOyZLwcMNc1gRMl5myPPPAIOItsOa1GJuqtyBfnGcL7aHlgnat5qG1VYgTZA/vjmOxPZOG3bswDjgOjlK8LTQEvgGOFOJDL3gscRPbHRmsw/wD5iKuJqm+5OtGO3As9SGl0IrOtPPAGMT6E4zO/SRNL/gNVZHTiig40MgAAAABJRU5ErkJggg=="/>}
                                      aria-label="Like it"
                                      onClick={() => {
                                        this.like(blob.returnValues._id)
                                      }}
                                    >
                                      Like it
                                    </Button>
                                  ):
                                  (
                                    <Button
                                      variant="heavy"
                                      aria-label="Unlike it"
                                      onClick={() => {
                                        this.unlike(blob.returnValues._id)
                                      }}
                                    >
                                      <Image boxSize="25px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABJ0lEQVRIie3UsSuFYRTH8Q/uILtbDEzsEpMk2y13MIlBBuVfMBopE4tSMpDMZgwWZVTKIOUWWVGSWwz3eev1dnlc3lsGvzqd87yn5/c9w3kf/pBacI87bKM/b0Af3lLxhKE8AXPB+AKnoT6MXWptADAS8hnWQj2cF2Aes6E+V5seXn4LaMUqNlHAPi7RG/pXMUDhi14HdjCJKtZxFHoDIR/HAGkl25FoN5wfsIiJEGXc+rhR6aiglJi0ZADpb89ox0IwTDSIpciwFfTEAMm5HDHL6iDt08ia/kh5A4ohPzYLMBXyXjMARYzjFcvNAMyo/VdbuM4b0IUxtelX0o28ANNok5k+L0A3RtWZPqvsU1Hx+XNQLzZik2QBJdx8w7iKE3TGAP+qq3d99VWqfM7/ZgAAAABJRU5ErkJggg=="/>
                                    </Button>
                                  )
                                ) :
                                (
                                  <Spinner />
                                )

                              )
                            )
                          }
                          </Center>
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

export default OwnedAvatars
