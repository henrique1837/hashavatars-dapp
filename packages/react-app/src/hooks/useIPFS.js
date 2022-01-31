import { useMemo, useState } from "react";
import * as IPFS from 'ipfs';
function useIpfs() {

  const [ipfs,setIpfs] = useState();

  useMemo(async () => {

    if(!ipfs){
      try{
        const newIpfs = await IPFS.create({
            EXPERIMENTAL: {
              pubsub: true
            },
            config: {
              Addresses: {
                Swarm: [
                  // Use IPFS dev signal server
                  // Prefer websocket over webrtc
                  //

                  // Websocket:
                  // '/dns4/ws-star-signal-2.servep2p.com/tcp/443//wss/p2p-websocket-star',
                  '/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                  '/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star'
                  // Local signal server
                  //'/ip4/127.0.0.1/tcp/4711/ws/p2p-websocket-star'
                  //
                  // WebRTC:
                  //'/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                  // Local signal server
                  // '/ip4/127.0.0.1/tcp/1337/ws/p2p-webrtc-star'
                ]
              },
              API: '',
              Gateway: '',
            }

        });
        setIpfs(newIpfs)
        for await (const res of newIpfs.name.resolve('/ipns/thehashavatars.com')) {
          await newIpfs.pin.add(res)
          console.log("Dapp pinned!")
        }
        // Pin contents //
        await newIpfs.pin.add("QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF");
        await newIpfs.pin.add("bafkreiaz6syhyt45764hiiqm75tkkuwvfczzqgzcl6bugkjfh6sru4meyy");
        await newIpfs.pin.add("QmQMdg8j9ssWbRxjKWb8JBW3PLAPvQN5cxZEP8DmhY1jrj");
        await newIpfs.pin.add("QmeSesTyeikbLnVjQnsgvhfxJrQz6taYLZxkDsbve7ntej");
        await newIpfs.pin.add("QmbKJ5wbYhio5h8NdGD6nyXmpJ7NFJqyqMAEbq8YwF8Kkk");
        await newIpfs.pin.add("QmUs9rX2FsYUML9PCWMExJZfgcTPiXGV3FpArrTxd1Yf8i");
        await newIpfs.pin.add("QmbUD9ekE1CBvZZsSC3PvrRE6oxgkrVfbHyNx7GaGCuX6o");

        console.log("IPFS started")
      } catch(err){
        console.log(err)
      }
    }

  },[ipfs])



  return({ipfs})
}

export default useIpfs;
