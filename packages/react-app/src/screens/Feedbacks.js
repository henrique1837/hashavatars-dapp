import React,{useState} from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { TextInput,Button } from '@aragon/ui'
import useWaku from "../hooks/useWaku";

function Feedbacks(){
  const [value,setValue] = useState();
  const {waku,sendMessage} = useWaku();

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

          </Col>
        </Row>
        <Row>
          <Col style={{wordBreak:'break-word'}} fontSize="md">
            {
              waku && sendMessage &&
              <>
              <TextInput
                value={value}
                onChange={event => {
                  setValue(event.target.value)
                }}
                id="input_msg"
              />
              <Button onClick={sendMsg}>Post</Button>
              </>
            }
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Feedbacks;
