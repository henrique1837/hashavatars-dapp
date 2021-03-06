// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class UriAdded extends ethereum.Event {
  get params(): UriAdded__Params {
    return new UriAdded__Params(this);
  }
}

export class UriAdded__Params {
  _event: UriAdded;

  constructor(event: UriAdded) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get uri(): string {
    return this._event.parameters[2].value.toString();
  }
}

export class Stories extends ethereum.SmartContract {
  static bind(address: Address): Stories {
    return new Stories("Stories", address);
  }

  erc1155(): Address {
    let result = super.call("erc1155", "erc1155():(address)", []);

    return result[0].toAddress();
  }

  try_erc1155(): ethereum.CallResult<Address> {
    let result = super.tryCall("erc1155", "erc1155():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  uriAdded(param0: Address, param1: BigInt): boolean {
    let result = super.call("uriAdded", "uriAdded(address,uint256):(bool)", [
      ethereum.Value.fromAddress(param0),
      ethereum.Value.fromUnsignedBigInt(param1)
    ]);

    return result[0].toBoolean();
  }

  try_uriAdded(param0: Address, param1: BigInt): ethereum.CallResult<boolean> {
    let result = super.tryCall("uriAdded", "uriAdded(address,uint256):(bool)", [
      ethereum.Value.fromAddress(param0),
      ethereum.Value.fromUnsignedBigInt(param1)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  uris(param0: BigInt, param1: BigInt): string {
    let result = super.call("uris", "uris(uint256,uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(param0),
      ethereum.Value.fromUnsignedBigInt(param1)
    ]);

    return result[0].toString();
  }

  try_uris(param0: BigInt, param1: BigInt): ethereum.CallResult<string> {
    let result = super.tryCall("uris", "uris(uint256,uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(param0),
      ethereum.Value.fromUnsignedBigInt(param1)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _erc1155(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AddUriCall extends ethereum.Call {
  get inputs(): AddUriCall__Inputs {
    return new AddUriCall__Inputs(this);
  }

  get outputs(): AddUriCall__Outputs {
    return new AddUriCall__Outputs(this);
  }
}

export class AddUriCall__Inputs {
  _call: AddUriCall;

  constructor(call: AddUriCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get uri(): string {
    return this._call.inputValues[1].value.toString();
  }
}

export class AddUriCall__Outputs {
  _call: AddUriCall;

  constructor(call: AddUriCall) {
    this._call = call;
  }
}
