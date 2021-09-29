import React from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink } from '@aragon/ui'
import { addresses } from "@project/contracts";

function Home(props){
  return(
    <Container>
      <h2>HashAvatars</h2>
      <Container>
        <Row>
          <Col style={{textAlign: 'left', wordBreak:'break-word'}} fontSize="md">
            <p>Each HashAvatar can be minted for 1 xDai (1 USD), after that you can sell for any price you want. Your collectable can not be replicated or ever destroyed, it will be stored on Blockchain forever.</p>
            <p>Choose your preferred HashAvatar and start your collection now!</p>
            <br/>
            <p>1 xDai = 1 HashAvatar</p>
            <br/>
            <p>The HashAvatar is built on xDai Chain, an Ethereum layer 2 sidechain that provides transactions cheaper and faster in a secure way, you must <Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>set your wallet to xDai Chain network <IconLink mx="2px" /></Link> in order to join.</p>
            <p>xDai ERC1155 at <Link href={`https://blockscout.com/xdai/mainnet/address/${addresses.erc1155.xdai}`} external>{addresses.erc1155.xdai} <IconLink /></Link></p>

            <br/>
            <p>You can also use it in rinkeby testnetwork to test.</p>
            <p>Rinkeby ERC1155 at <Link href={`https://rinkeby.etherscan.io/address/${addresses.erc1155.rinkeby}`} external>{addresses.erc1155.rinkeby} <IconLink mx="2px" /></Link></p>

            <br/>
            <p>This project uses "avataaars" package from <Link href="https://getavataaars.com/" isExternal>https://getavataaars.com/ <IconLink mx="2px" /></Link> and can be copied / modified by anyone.</p>
          </Col>
          <Col style={{textAlign: 'center'}}>
            <Image boxSize="200px" src="https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF" />
          </Col>
        </Row>
      </Container>
    </Container>
  )
}

export default Home;
