import React,{useState,useMemo} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink } from '@aragon/ui'
import connect from '@aragon/connect';
//import connectVoting from '@aragon/connect-voting';
import useWeb3Modal from '../hooks/useWeb3Modal';

function DAO(){

  const [votes,setVotes] = useState();
  const {netId} = useWeb3Modal();

  useMemo(async () => {
    /*
    if(!votes && netId){
      const org = await connect('hashavatars.aragonid.eth', 'thegraph',{network: netId})
      //const voting = await connectVoting(org.app('voting'));
      //const newVotes = await voting.votes({first: 5});
      //setVotes(newVotes);
    }
    */
  },[votes,netId]);

  return(
    <>
    <p>Votes</p>
    </>
  )
}

export default DAO;
