import React,{useState,useCallback} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { IdentityBadge,Pagination,Split,TokenAmount,Button,EthIdenticon,ProgressBar,DataView,Checkbox } from '@aragon/ui'
import { Link as RouterLink } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'
import  useHashGovern  from '../hooks/useHashGovern'

function Governance(){
  const { state } = useAppContext();
  const {erc20votes,hashGovern,proposals,hashBalance,approved,wrapped} = useHashGovern();
  const [checked,setChecked] = useState([]);

  const wrap = useCallback(async (all) => {
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
    await tx.wait();
  },[state.myOwnedNfts,erc20votes,state.hashavatars,state.provider]);

  const release = useCallback(async (all) => {
    const signer = state.provider.getSigner()
    const tokenWithSigner = erc20votes.connect(signer);
    let tx;
    if(all){
      const addresses = Array(wrapped.length).fill(state.hashavatars.address);
      tx = await tokenWithSigner.unlock(addresses,wrapped);
    } else {
      // To be implemented
    }
    await tx.wait();
  },[wrapped,erc20votes,state.hashavatars,state.provider]);

  const approve = useCallback(async () => {
      const signer = state.provider.getSigner()

      const tokenWithSigner = state.hashavatars.connect(signer);

      const tx = await tokenWithSigner.setApprovalForAll(erc20votes.address,true);
      await tx.wait();

  },[state.hashavatars,erc20votes]);
  return(
    <>

      <Container>

        <Split
          primary={
            <>
            {
              hashGovern &&
              <IdentityBadge
                label={"HashGovern"}
                entity={hashGovern.address}
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
              />
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
                    <RouterLink to={`/proposal/${log.args[0].toString()}`}>{log.args[8].toString()}</RouterLink>,
                    <IdentityBadge
                      entity={log.args[1].toString()}
                      badgeOnly
                      networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                    />,
                   ]
                }}
              />
            }
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
                <Button onClick={release}>Release</Button>
                </>
              }

              {
                erc20votes &&
                approved === false &&
                <Button onClick={approve}>Approve to wrap HashAvatars</Button>
              }

              {
                approved === true &&
                state.myOwnedNfts?.length > 0 &&
                <>
                <p>Wrap HashAvatars to earn HashVoteToken</p>
                <Row>
                  <Col><Button onClick={() => wrap(true)}>Wrapp all</Button></Col>
                  <Col><Button onClick={() => wrap(false)}>Wrapp selected</Button></Col>
                </Row>
                <DataView
                  fields={['ID','Name','Image']}
                  entries={state.myOwnedNfts}
                  renderEntry={(str) => {
                    const obj = JSON.parse(str);
                    return [
                      <>
                        <Checkbox
                          checked={checked.includes(obj.returnValues._id)}
                          onChange={() => {
                            const newChecked = checked;
                            if(!newChecked.includes(obj.returnValues._id)){
                              newChecked.push(obj.returnValues._id);
                            } else {
                              newChecked = checked.filter(i => {
                                return(i !== obj.returnValues._id);
                              })
                            }
                            setChecked(newChecked);
                          }}
                        />
                        <b>{obj.returnValues._id}</b>
                      </>,
                      <b>{obj.metadata.name}</b>,
                      <Image src={obj.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="50px"/>,
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
