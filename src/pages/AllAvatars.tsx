import * as React from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Stack,
  Grid,
  Button,
  theme,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Select,
  Avatar as Av
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'
import makeBlockie from 'ethereum-blockies-base64';

import Avatar from 'avataaars';


class OwnedAvatars extends React.Component {

  state = {
    savedBlobs: [],
    hasLiked: [],
    likes: [],
    loadingLikes: [],
    page: 1,
    loading: true
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
    this.handleLikes = this.handleLikes.bind(this);
    this.checkTokens = this.props.checkTokens;
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    const promises = [];
    const results = await this.props.checkTokens();
    const totalPages = (results.length/10);
    const pages = [];
    for(let i = 0;i<totalPages;i++){
      pages.push(i);
    }
    this.setState({
      pages: pages
    })
    for(let res of results.filter(item => {if(item.returnValues._id <= 10){return(item)}})){
      promises.push(this.handleEvents(null,res));
    }
    await Promise.all(promises);
    await this.forceUpdate();
    const itoken = this.props.itoken;
    const tokenLikes = this.props.tokenLikes;
    /*
    itoken.events.TransferSingle({
      filter: {
        from: '0x0000000000000000000000000000000000000'
      },
      fromBlock: 'latest'
    }, this.handleEvents);
    */
    if(tokenLikes){
      tokenLikes.events.LikeOrUnlike({
        filter:{

        },
        fromBlock:'latest'
      },this.handleLikes);
      this.setState({loading: false})
    }
  }

  handleEvents = async (err, res) => {
    try {
      const web3 = this.props.web3;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      if(uri.includes("QmWXp3VmSc6CNiNvnPfA74rudKaawnNDLCcLw2WwdgZJJT")){
        return
      }
      let likes = 0;
      let liked;
      if(this.props.tokenLikes){
        likes = await this.props.tokenLikes.methods.likes(res.returnValues._id).call();
        if(this.props.coinbase){
          liked = await this.props.tokenLikes.methods.liked(this.props.coinbase,res.returnValues._id).call();
        }
      }
      console.log(uri)
      console.log(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text())
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());
      const creator = await this.props.itoken.methods.creators(res.returnValues._id).call();


      console.log(metadata)
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator
      }
      if (!this.state.savedBlobs.includes(JSON.stringify(obj))) {
        this.state.savedBlobs.push(JSON.stringify(obj));
      }
      this.state.likes[obj.returnValues._id] =  {
                                                  likes: likes,
                                                  liked: liked
                                                };

    } catch (err) {
      console.log(err);
    }
  }

  handleLikes = async (err,res) => {
    if(!res){
      return
    }
    let likes = 0;
    let liked;
    if(this.props.tokenLikes){
      likes = await this.props.tokenLikes.methods.likes(res.returnValues.id).call();
      if(this.props.coinbase){
        liked = await this.props.tokenLikes.methods.liked(this.props.coinbase,res.returnValues.id).call();
      }
    }

    this.state.loadingLikes[res.returnValues.id] =  true
    await this.forceUpdate();
    this.state.likes[res.returnValues.id] =  {
                                                likes: likes,
                                                liked: liked
                                              };
    this.state.loadingLikes[res.returnValues.id] =  false
    await this.forceUpdate();
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

  changePage = async (e) => {
    this.setState({
      loading: true,
      savedBlobs: [],
      page: e.target.value
    });
    const promises = [];
    const results = await this.props.checkTokens();
    const totalPages = (results.length/10);
    const pages = [];
    for(let i = 0;i<totalPages;i++){
      pages.push(i);
    }
    this.setState({
      pages: pages
    })
    for(let res of results){
      if(res.returnValues._id > 10*Number(e.target.value) &&
         res.returnValues._id <= 10*(Number(e.target.value)+1)){

           promises.push(this.handleEvents(null,res));

      }
    }
    await Promise.all(promises);
    await this.forceUpdate();
    this.setState({loading:false})

  }


  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            <Heading>All HashAvatars generated</Heading>
            </Box>
            <Box>
            <Select placeholder="Select page" onChange={this.changePage}>
              {
                this.state.pages?.map(item => {
                  return(
                    <option value={item}>Page {item+1} - From ID {item*10 + 1} to {(item+1)*10}</option>
                  )
                })
              }
            </Select>
            </Box>
            <Box>
            {
              (
                this.state.loading ?
                (
                  <Center>
                   <VStack spacing={4}>
                    <p>Loading ...</p>
                    <Av
                      size={'xl'}
                      src={
                        'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                      }
                    />
                    <Spinner size="xl" />
                    </VStack>
                  </Center>
                ) :
                (
                  this.state.savedBlobs.length == 0 ?
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
                      columns={{ sm: 1, md: 5 }}
                      spacing="40px"
                      mb="20"
                      justifyContent="center"
                    >
                    {
                      this.state.savedBlobs?.map((string) => {
                        const blob = JSON.parse(string);
                        return(
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
                                  <object type="text/html"
                                  data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                                  width="196px"
                                  style={{borderRadius: "100px"}}>
                                  </object>
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
                                  <small>Creator: <Link href={`https://3box.io/${blob.creator}`} isExternal><Av src={makeBlockie(blob.creator)} size='sm' alt="" />{' '}{blob.creator}</Link></small>
                                </p>
                                <p><small><Link href={`https://epor.io/tokens/${this.props.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                                <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.props.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Divider mt="4" />
                            <Center>
                              <Text>
                                <p>Likes: {this.state.likes[blob.returnValues._id].likes}</p>
                              </Text>
                            </Center>
                            <Center>

                            {
                              (
                                this.props.coinbase &&
                                (
                                  !this.state.loadingLikes[blob.returnValues._id] ?
                                  (
                                    !this.state.likes[blob.returnValues._id].liked ?
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
                        )
                      })
                    }
                    </SimpleGrid>
                  )
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
