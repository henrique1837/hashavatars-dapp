import React from "react";
import { Container,Navbar,Nav,NavDropdown } from 'react-bootstrap';
import { Button,IdentityBadge,EthIdenticon,Image,Link } from '@aragon/ui';
import useWeb3Modal from "../hooks/useWeb3Modal";
import useProfile from "../hooks/useProfile";

function Menu(){

  const [provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId] = useWeb3Modal();
  const profile = useProfile();

  return(
    <>
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Hash Avatars</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Informations</Nav.Link>
            <Nav.Link href="#mint"><b>Generate Avatar</b></Nav.Link>
            {
              coinbase &&
              <Nav.Link href="#profile">Profile</Nav.Link>
            }
            <Nav.Link href="#all-avatars">All Avatars</Nav.Link>
            <NavDropdown title="More" id="basic-nav-dropdown">
              <NavDropdown.Item style={{textAlign:'left'}} as={Link} href="https://bafybeidlgfpmk226fjz3uwbpzm5jy5uckioqbn5idztn3p7hywggvwdtz4.ipfs.dweb.link/#/feedbacks" external>Feedbacks</NavDropdown.Item>
              <NavDropdown.Item style={{textAlign:'left'}} as={Link} href="https://bafybeidlgfpmk226fjz3uwbpzm5jy5uckioqbn5idztn3p7hywggvwdtz4.ipfs.dweb.link/#/games" external>Games</NavDropdown.Item>
              <NavDropdown.Item style={{textAlign:'left'}} as={Link} href="https://bafybeidlgfpmk226fjz3uwbpzm5jy5uckioqbn5idztn3p7hywggvwdtz4.ipfs.dweb.link/#/collections" external>Collections</NavDropdown.Item>
              <NavDropdown.Divider />

              <NavDropdown.Item style={{textAlign:'left'}} as={Link} href="https://bafybeidlgfpmk226fjz3uwbpzm5jy5uckioqbn5idztn3p7hywggvwdtz4.ipfs.dweb.link/#/" external>Previous Version</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {
      coinbase &&
      (
        netId === 4 ?
        "RINKEBY" :
        netId === 0x64 ?
        "XDAI" :
        "WRONG NETWORK"
      )
    }
    {
      coinbase ?
      <IdentityBadge
        customLabel={profile?.name}
        entity={coinbase}
        connectedAccount
        popoverTitle={profile?.name}
        icon={profile?.image ?
              <Image src={profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
              <EthIdenticon address={coinbase}/>
        }
      /> :
      <Button
        onClick={() => {
          if (!coinbase) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
          }
        }}
      >
        {!coinbase ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
    }
    </>
  )
}


export default Menu;
