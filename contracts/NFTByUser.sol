// SPDX-License-Identifier: MIT

/*
Revision v2
- Added minting fee balance withdraw function
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//ERC721URIStorage expecting user to provide IPFS path to metadata DYNAMICALLY

contract NFTByUser is ERC721URIStorage, Ownable {  
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;
    address contractAddress;
    uint256 public cost = 0.0075 ether; //Minting Fee 

    constructor(address marketContract) ERC721("n2DMarket", "N2DM") {
        contractAddress = marketContract;
    }

    function createNFT(string memory tokenURI) public returns (uint) { //path to tokenURi
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }

    function mintNFT(string memory tokenURI) public payable returns (uint) {
        require(msg.value == cost, "Need to send 0.075 ether!");
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }

    function withdraw() public payable onlyOwner() {
        require(payable(msg.sender).send(address(this).balance));
    }
}