// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import "./HashAvatarsVoteToken.sol";

contract ERC1155VoterWrapper is Ownable,Pausable,IERC1155Receiver {


  HashAvatarsVoteToken public erc20votes;
  mapping(address => bool) public allowedErc1155;
  mapping(address => mapping(uint256 => bool)) public locked;
  mapping(address => mapping(uint256 => address)) public locker;

  modifier onlyAllowedErc1155(address _erc1155){
    require(allowedErc1155[_erc1155],"Token not allowed");
    _;
  }

  constructor(HashAvatarsVoteToken _erc20votes,address[] memory _erc1155){
    erc20votes = HashAvatarsVoteToken(_erc20votes);
    for(uint i =0 ;i < _erc1155.length; i++){
      allowedErc1155[_erc1155[i]] = true;
    }
  }

  function lock(address _erc1155,uint256 _tokenId) onlyAllowedErc1155(_erc1155) public whenNotPaused {
    require(!locked[_erc1155][_tokenId],"Token already locked");
    IERC1155(_erc1155).safeTransferFrom(msg.sender,address(this),_tokenId,1,"");
    erc20votes.mint(msg.sender,1);
    locked[_erc1155][_tokenId] = true;
    locker[_erc1155][_tokenId] = msg.sender;
  }

  function unlock(address _erc1155,uint256 _tokenId) public {
    require(locked[_erc1155][_tokenId],"Token not locked");
    require(locker[_erc1155][_tokenId] == msg.sender,"Token can only be unlocked by locker");

    IERC1155(_erc1155).safeTransferFrom(address(this),msg.sender,_tokenId,1,"");
    erc20votes.transferFrom(msg.sender,0x000000000000000000000000000000000000dEaD,1);
    locked[_erc1155][_tokenId] = false;
    delete(locker[_erc1155][_tokenId]);
  }
  function allowToken(address _erc1155) public onlyOwner{
    require(!allowedErc1155[_erc1155],"Token already allowed");
    allowedErc1155[_erc1155] = true;
  }
  function pause() public onlyOwner {
      _pause();
  }
  function unpause() public onlyOwner {
      _unpause();
  }



    /**
        @dev Handles the receipt of a single ERC1155 token type. This function is
        called at the end of a `safeTransferFrom` after the balance has been updated.
        To accept the transfer, this must return
        `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
        (i.e. 0xf23a6e61, or its own function selector).
        @param operator The address which initiated the transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param id The ID of the token being transferred
        @param value The amount of tokens being transferred
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
    */


    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    )
        external
        override(IERC1155Receiver)
        returns(bytes4){
            return(bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")));
        }

    /**
        @dev Handles the receipt of a multiple ERC1155 token types. This function
        is called at the end of a `safeBatchTransferFrom` after the balances have
        been updated. To accept the transfer(s), this must return
        `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
        (i.e. 0xbc197c81, or its own function selector).
        @param operator The address which initiated the batch transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param ids An array containing ids of each token being transferred (order and length must match values array)
        @param values An array containing amounts of each token being transferred (order and length must match ids array)
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
    */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    )
        external
        override(IERC1155Receiver)
        returns(bytes4){
            return(bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)")));
        }

     function supportsInterface(bytes4 interfaceId) external view override(IERC165) returns (bool){
         return(true);
     }

}
