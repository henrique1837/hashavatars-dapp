import React,{useState} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { TextInput,Button,LoadingRing,IdentityBadge,EthIdenticon } from '@aragon/ui';
import { Link as RouterLink } from 'react-router-dom';

import useWaku from "../hooks/useWaku";

function Feedbacks(){
  const [value,setValue] = useState();
  const {waku,sendMessage,msgs} = useWaku();

  const sendMsg = () => {
    if(value){
      sendMessage(value);
    }
    setValue("");
    document.getElementById('input_msg').value = "";
  }

  return(
    <>
      <h2>Feedbacks</h2>
      <small>Suggestions? Some idea? Partnership? Make a joke? Feel free to give your feedback!</small>

      <Container>
        <Row>
          <Col style={{wordBreak:'break-word'}} fontSize="md">
            {
              waku && sendMessage ?
              <>
              <TextInput
                value={value}
                onChange={event => {
                  setValue(event.target.value)
                }}
                id="input_msg"
              />
              <Button onClick={sendMsg}>Post</Button>
              </> :
              <>
              <LoadingRing style={{width: '50px'}}/>
              <p>Loading js-waku ...</p>
              </>
            }
          </Col>
        </Row>
      </Container>
      <Container>
        {
          msgs.map(obj => {
            return(
              <Row>
              <Col style={{wordBreak:'break-word'}} fontSize="md">
              <center>
              <RouterLink to={`/profiles/${obj.address}`} style={{textDecoration: "none"}}>
                <IdentityBadge
                  label={obj.payload.profile?.name}
                  entity={obj.payload.from}
                  badgeOnly
                  popoverTitle={obj.payload.profile?.name }
                  icon={obj.payload.profile?.image ?
                        <img src={obj.payload.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} alt={obj.payload.from} /> :
                        <EthIdenticon address={obj.payload.from}/>
                  }
                />
              </RouterLink>
              </center>
              </Col>
              <Col style={{wordBreak:'break-word'}} fontSize="md">
                <p><small>{new Date(obj.timestamp).toUTCString()}</small></p>
                <p>{obj.payload.message}</p>
              </Col>
              </Row>
            )
          })
      }
      </Container>
    </>
  )
}

export default Feedbacks;
