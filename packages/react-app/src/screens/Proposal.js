import React,{useState,useCallback,useMemo} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Pagination,Split,TokenAmount,Button,EthIdenticon,ProgressBar,DataView,Radio } from '@aragon/ui'
import { Link as RouterLink,useParams } from 'react-router-dom';

import { useAppContext } from '../hooks/useAppState'
import  useHashGovern  from '../hooks/useHashGovern'

function Proposal(){
  const { state } = useAppContext();
  const {hashGovern,erc20votes,hashBalance} = useHashGovern();
  const {proposalId} = useParams();
  const [proposal,setProposal] = useState();
  const [selected,setSelected] = useState();

  useMemo(async () => {
    if(proposalId && !proposal && hashGovern){
      const proposalSnapshot = await hashGovern.proposalSnapshot(proposalId);
      const proposalDeadline = await hashGovern.proposalDeadline(proposalId);
      const proposalState = await hashGovern.state(proposalId);
      let hasVoted;
      let votingPower;
      if(state.coinbase){
        hasVoted = await hashGovern.hasVoted(proposalId,state.coinbase);
        votingPower = await hashGovern.getVotes(state.coinbase,proposalSnapshot);
      }
      setProposal({
        snapshot: proposalSnapshot,
        deadline: proposalDeadline,
        state: proposalState,
        hasVoted: hasVoted,
        votingPower: votingPower
      })
    }
  },[proposalId,proposal,hashGovern,state.coinbase]);

  const vote = useCallback(async () => {
    const signer = state.provider.getSigner()

    const governWithSigner = hashGovern.connect(signer);

    const tx = await governWithSigner.castVote(proposalId,selected);
    await tx.wait();
  },[hashGovern,state.provider,proposalId,selected]);

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
              proposalId &&
              <p>ID: {proposalId}</p>
            }
            {
              proposal &&
              <div>
                <p>Snapshot: {proposal.snapshot}</p>
                <p>Deadline: {proposal.deadline}</p>

              </div>
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
                proposal &&
                <>
                <p>Voting Power</p>
                <TokenAmount
                  address={state.coinbase}
                  amount={proposal.votingPower}
                  decimals={0}
                  iconUrl={'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'}
                  symbol={"HVT"}
                />
                <label>
                <Radio
                  id="yes"
                  checked={selected === 0}
                  onChange={id => {
                    setSelected(0)
                  }}
                />
                Yes
                </label>
                <label>
                <Radio
                  id="no"
                  checked={selected === 1}
                  onChange={id => {
                    setSelected(1)
                  }}
                />
                No
                </label>
                <Button onClick={vote}></Button>
                </>
              }
              </div>
          }
        />

      </Container>
    </>
  )
}

export default Proposal;
