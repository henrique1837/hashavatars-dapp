import { useMemo,useState } from "react";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx';

import { Waku,WakuMessage } from 'js-waku';

import useWeb3Modal from './useWeb3Modal.js';

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const contentTopic = "/hashavatars-dapp/1/feedbacks/proto";

function useWaku() {
  const {coinbase} = useWeb3Modal();
  const [waku,setWaku] = useState();
  const [msgs,setMsgs] = useState([]);

  const sendMessage = async (message) => {
    const str = JSON.stringify({
      message: message,
      from: coinbase
    });
    const msg = await WakuMessage.fromUtf8String(str,contentTopic);
    await waku.relay.send(msg);
  };

  const handleMsgReceived = async (msg) => {
    console.log('Message retrieved:', msg.payloadAsUtf8);
    const obj = JSON.parse(msg.payloadAsUtf8);
    if(obj.from !== null){
      obj.profile = await getLegacy3BoxProfileAsBasicProfile(obj.from);
    }
    const treatedMsg = {
      payloadAsUtf8: JSON.stringify(obj),
      timestamp: msg.timestamp
    };
    const newMessages = [...msgs,msg.payloadAsUtf8];
    setMsgs(newMessages);
  };

  useMemo(async () => {
    if(!waku){
      const newWaku = await Waku.create();
      alert(newWaku)
      setWaku(newWaku);
      newWaku.relay.addObserver((msg) => {
        handleMsgReceived(msg);
      }, [contentTopic]);
      // Process messages once they are all retrieved
      const messages = await waku.store.queryHistory([contentTopic]);
      messages.forEach((msg) => {
          handleMsgReceived(msg);
      });
    }
  }, [waku,handleMsgReceived]);
  return({waku,msgs,sendMessage})
}

export default useWaku;
