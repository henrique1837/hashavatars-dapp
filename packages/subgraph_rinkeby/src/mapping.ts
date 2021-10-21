import { BigInt } from "@graphprotocol/graph-ts"
import {
  HashAvatars as TokenContract,
  ApprovalForAll,
  SecondarySaleFees,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/HashAvatars/HashAvatars"

import {
  Token, User,Metadata
} from '../generated/schema'

import { Bytes, ipfs, json, JSONValueKind, log } from '@graphprotocol/graph-ts'



export function handleApprovalForAll(event: ApprovalForAll): void {

}

export function handleSecondarySaleFees(event: SecondarySaleFees): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {
  let token = Token.load(event.params._id.toString());
  if (!token) {
    token = new Token(event.params._id.toString());
    token.creator = event.params._to.toHexString();
    token.tokenID = event.params._id;

    let tokenContract = TokenContract.bind(event.address);
    token.metadataURI = tokenContract.uri(event.params._id);
    //token.metadata = event.params._id.toString();
    token.createdAtTimestamp = event.block.timestamp;
    token.owner = event.params._to.toHexString();

  }

  /*
  let hash = token.metadataURI.split("/").pop();
  if (hash != null) {
    let raw = ipfs.cat(hash)
    if (raw != null) {
      let value = json.fromBytes(raw as Bytes);
      if (value.kind == JSONValueKind.OBJECT) {
        let data = value.toObject();
        let metadata = Metadata.load(event.params._id.toString());
        if(!metadata){
          metadata = new Metadata(event.params._id.toString());

          if (data.isSet('name')) {
            metadata.name = data.get('name').toString()
          }

          if (data.isSet('description')) {
            metadata.description = data.get('description').toString()
          }

          if (data.isSet('image')) {
            metadata.image = data.get('image').toString()
          }
          metadata.save();
        }

      }
    }
  }
  */

  token.save();
  let user = User.load(event.params._to.toHexString());
  if (!user) {
    user = new User(event.params._to.toHexString());
    user.save();
  }

}

export function handleURI(event: URI): void {}
