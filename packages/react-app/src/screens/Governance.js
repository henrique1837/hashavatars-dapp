import React,{useState,useCallback} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { IdentityBadge,Pagination,Tabs,Split,TokenAmount,TransactionBadge,Button,EthIdenticon,ProgressBar,DataView,Checkbox,Link } from '@aragon/ui'

import { useAppContext } from '../hooks/useAppState'
import  useHashGovern  from '../hooks/useHashGovern'
import Feedbacks from '../components/Feedbacks';

function Governance(){
  const { state } = useAppContext();
  const {erc20votes,hashGovern,proposals,hashBalance,approved,wrapped} = useHashGovern();
  const [checked,setChecked] = useState([]);
  const [txMsg,setTxMsg] = useState();
  const [selected, setSelected] = useState();



  const wrap = useCallback(async (all) => {
    setTxMsg(<p><small>Wrapping ...</small></p>)
    try{
      const signer = state.provider.getSigner()
      const tokenWithSigner = erc20votes.connect(signer);
      let tx;
      if(all){
        const ids = state.myOwnedNfts.map(str => {
          const obj = JSON.parse(str);
          return(obj.returnValues._id)
        });
        const addresses = Array(ids.length).fill(state.hashavatars.address);
        tx = await tokenWithSigner.lock(addresses,ids);
      } else {

        const ids = checked
        const addresses = Array(ids.length).fill(state.hashavatars.address);
        tx = await tokenWithSigner.lock(addresses,ids);
      }
      setTxMsg(
        <div>
         Tx sent <TransactionBadge
                  as={Link}
                  href={state.netId !== 4 ? `https://blockscout.com/xdai/mainnet/tx/${tx.hash}` : `https://rinkeby.etherscan.io/tx/${tx.hash}`}
                  transaction={tx.hash}
                  external
                  networkType={state.netId !== 4 ? "xdai" : "rinkeby"}
                 />
        </div>
      )
      await tx.wait();
      setTxMsg(<p><small>Transaction confirmed! UI will update soon ...</small></p>)
      setTimeout(() => {
        setTxMsg(null)
      },10000)
    } catch(err){
      setTxMsg(<p><small>{err.message}</small></p>)
      setTimeout(() => {
        setTxMsg(null);
      },2000)
    }
  },[state.myOwnedNfts,erc20votes,state.hashavatars,state.provider]);

  const release = useCallback(async (all) => {
    try{
      setTxMsg(<p><small>Releasing ...</small></p>)
      const signer = state.provider.getSigner()
      const tokenWithSigner = erc20votes.connect(signer);
      let tx;
      if(all){
        const addresses = Array(wrapped.length).fill(state.hashavatars.address);
        tx = await tokenWithSigner.unlock(addresses,wrapped);
      } else {
        // To be implemented
      }
      setTxMsg(
        <div>
         Tx sent <TransactionBadge
                  as={Link}
                  href={state.netId !== 4 ? `https://blockscout.com/xdai/mainnet/tx/${tx.hash}` : `https://rinkeby.etherscan.io/tx/${tx.hash}`}
                  transaction={tx.hash}
                  external
                  networkType={state.netId !== 4 ? "xdai" : "rinkeby"}
                 />
        </div>
      )
      await tx.wait();
      setTxMsg(<p><small>Transaction confirmed! UI will update soon ...</small></p>)
      setTimeout(() => {
        setTxMsg(null)
      },10000)
    } catch(err){
      setTxMsg(<p><small>{err.message}</small></p>)
      setTimeout(() => {
        setTxMsg(null);
      },2000)
    }
  },[wrapped,erc20votes,state.hashavatars,state.provider]);

  const approve = useCallback(async () => {

    try{
      setTxMsg(<p><small>Approving ...</small></p>)

      const signer = state.provider.getSigner()

      const tokenWithSigner = state.hashavatars.connect(signer);

      const tx = await tokenWithSigner.setApprovalForAll(erc20votes.address,true);
      setTxMsg(
        <div>
         Tx sent <TransactionBadge
                  as={Link}
                  href={state.netId !== 4 ? `https://blockscout.com/xdai/mainnet/tx/${tx.hash}` : `https://rinkeby.etherscan.io/tx/${tx.hash}`}
                  transaction={tx.hash}
                  external
                  networkType={state.netId !== 4 ? "xdai" : "rinkeby"}
                 />
        </div>
      )
      await tx.wait();
      setTxMsg(<p><small>Transaction confirmed! UI will update soon ...</small></p>)
      setTimeout(() => {
        setTxMsg(null)
      },10000)
    } catch(err){
      setTxMsg(<p><small>{err.message}</small></p>)
      setTimeout(() => {
        setTxMsg(null);
      },2000)
    }

  },[state.hashavatars,erc20votes]);
  return(
    <>

      <Container>

        <Split
          primary={
            <>
            {
              hashGovern &&
              <>
              <IdentityBadge
                label={"HashGovern"}
                entity={hashGovern.address}
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
              />
              <p><Link href={`https://alpha.withtally.com/governance/eip155:4:${hashGovern.address}`} external>View on Tally</Link></p>
              </>
            }
            {
              proposals ?
              <p><small>Total of {proposals.length} proposals</small></p> :
              <p>Loading proposals ...</p>
            }
            {
              proposals?.length > 0 &&
              <DataView
                fields={['Description','Proposer']}
                entries={proposals}
                renderEntry={(log) => {
                  return [
                    <Link href={`https://alpha.withtally.com/governance/eip155:4:${hashGovern.address}/proposal/${log.args[0].toString()}`} external>{log.args[8].toString()}</Link>,
                    <IdentityBadge
                      entity={log.args[1].toString()}
                      badgeOnly
                      networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                    />,
                   ]
                }}
              />
            }
            <Feedbacks />

            </>

          }
          secondary={
              <div>
              {
                erc20votes &&
                <IdentityBadge
                  label={"HashVoteToken"}
                  entity={erc20votes.address}
                  networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                />
              }
              {
                hashBalance &&
                <>
                <TokenAmount
                  address={state.coinbase}
                  amount={hashBalance}
                  decimals={0}
                  iconUrl={'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'}
                  symbol={"HVT"}
                />
                {
                  !txMsg && <Button onClick={release}>Release</Button>
                }
                </>
              }

              {
                erc20votes &&
                approved === false &&
                (
                  !txMsg ?
                  <Button onClick={approve}>Approve to wrap HashAvatars</Button> :
                  txMsg
                )
              }

              {
                approved === true &&
                state.myOwnedNfts?.length > 0 &&
                <>
                <p>Wrap HashAvatars to earn HashVoteToken</p>
                {
                  !txMsg ?
                  <Row>
                    <Col><Button onClick={() => wrap(true)}>Wrapp all</Button></Col>
                    <Col><Button onClick={() => wrap(false)}>Wrapp selected</Button></Col>
                  </Row> :
                  txMsg
                }
                <DataView
                  fields={['','ID','Image']}
                  entries={state.myOwnedNfts}
                  renderEntry={(str) => {
                    const obj = JSON.parse(str);
                    return [
                      <Checkbox
                          checked={checked.includes(obj.returnValues._id)}
                          onClick={() => {
                            let newChecked = checked;
                            if(!newChecked.includes(obj.returnValues._id)){
                              newChecked.push(obj.returnValues._id);
                            } else {
                              newChecked = checked.filter(i => {
                                return(i !== obj.returnValues._id);
                              })
                            }
                            setChecked(newChecked);
                          }}
                      />,
                      <b>{obj.returnValues._id}</b>,
                      <Image src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="50px" title={obj.metadata.name} alt={obj.metadata.name}/>,
                     ]
                  }}
                />
                </>
              }

              </div>
          }
        />

      </Container>
    </>
  )
}

export default Governance;
