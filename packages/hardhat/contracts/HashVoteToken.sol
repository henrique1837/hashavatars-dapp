// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

contract HashVoteToken is ERC20, ERC20Permit, ERC20Votes,Ownable,Pausable,IERC1155Receiver {

    mapping(address => bool) public allowedErc1155;
    mapping(address => uint256) public erc1155Power;

    mapping(address => mapping(uint256 => bool)) public locked;
    mapping(address => mapping(uint256 => address)) public locker;

    constructor(address[] memory _erc1155,uint256[] memory _power)
        ERC20("HashVoteToken", "HVT")
        ERC20Permit("HashVoteToken"){

      for(uint i =0 ;i < _erc1155.length; i++){
        allowedErc1155[_erc1155[i]] = true;
        erc1155Power[_erc1155[i]] = _power[i];
      }
    }

    event CollectibleAllowed(address erc1155,uint256 power);
    event Locked(address owner,address indexed erc1155,uint256 indexed tokenId);
    event Unlocked(address owner,address indexed erc1155,uint256 indexed tokenId);

    modifier onlyAllowedErc1155(address _erc1155){
      require(allowedErc1155[_erc1155],"Collectible not allowed");
      _;
    }

    function lock(address[] memory _erc1155,uint256[] memory _tokenId) external whenNotPaused returns(bool) {
      for(uint256 i = 0;i < _erc1155.length;i++){
        _lock(_erc1155[i],_tokenId[i]);
      }
      return(true);
    }

    function unlock(address[] memory _erc1155,uint256[] memory _tokenId) external returns(bool){
      for(uint256 i =0;i < _erc1155.length;i++){
        _unlock(_erc1155[i],_tokenId[i]);
      }
    }

    function _lock(address _erc1155,uint256 _tokenId) internal onlyAllowedErc1155(_erc1155) {
      require(!locked[_erc1155][_tokenId],"Collectible already locked");
      IERC1155(_erc1155).safeTransferFrom(msg.sender,address(this),_tokenId,1,"");
      _mint(msg.sender,erc1155Power[_erc1155]);
      locked[_erc1155][_tokenId] = true;
      locker[_erc1155][_tokenId] = msg.sender;
      emit Locked(msg.sender,_erc1155,_tokenId);
    }

    function _unlock(address _erc1155,uint256 _tokenId) internal {
      require(locked[_erc1155][_tokenId],"Collectible not locked");
      require(locker[_erc1155][_tokenId] == msg.sender,"Collectible can only be unlocked by locker");

      IERC1155(_erc1155).safeTransferFrom(address(this),msg.sender,_tokenId,1,"");
      _burn(msg.sender,erc1155Power[_erc1155]);
      locked[_erc1155][_tokenId] = false;
      delete(locker[_erc1155][_tokenId]);
      emit Unlocked(msg.sender,_erc1155,_tokenId);
    }

    function transfer(address to, uint256 amount) public override(ERC20) returns (bool) {
      revert("ERC20 cant be transfered");
    }
    function transferFrom(address from,address to, uint256 amount) public override(ERC20) returns (bool) {
      revert("ERC20 cant be transfered");
    }


    function allowErc1155(address _erc1155,uint256 _power) public onlyOwner{
      require(!allowedErc1155[_erc1155],"Collectible already allowed");
      allowedErc1155[_erc1155] = true;
      erc1155Power[_erc1155] = _power;
      emit CollectibleAllowed(_erc1155,_power);
    }
    function pause() public onlyOwner {
      _pause();
    }
    function unpause() public onlyOwner {
      _unpause();
    }

    // The functions below are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
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
