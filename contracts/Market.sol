// SPDX-License-Identifier: MIT LICENSE

/*

Revision v2
- Added listing and minting fee balance 
  withdraw function.
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract UserMP is ReentrancyGuard, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable holder;
  uint256 listingFee = 0.0025 ether;
  uint256 mintingFee = 0.0075 ether;

  constructor() {
    holder = payable(msg.sender);
  }

  struct VaultItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable holder;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => VaultItem) private idToVaultItem;

  event VaultItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address holder,
    uint256 price,
    bool sold
  );

  function getListingFee() public view returns (uint256) {
    return listingFee;
  }
  
    //Calling NFT contract, token will transfer to MP
  function createVaultItem(address nftContract,uint256 tokenId,uint256 price) public payable nonReentrant {
    require(price > 0, "Price cannot be zero");
    require(msg.value == listingFee, "Price cannot be listing fee");
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    idToVaultItem[itemId] =  VaultItem(itemId,nftContract,tokenId,payable(msg.sender),payable(address(0)),price,false);
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    emit VaultItemCreated(itemId,nftContract,tokenId,msg.sender,address(0),price,false);}

    //buy the NFT
  function n2DMarketSale(
    address nftContract,uint256 itemId
    ) public payable nonReentrant {

    uint price = idToVaultItem[itemId].price;
    uint tokenId = idToVaultItem[itemId].tokenId;
    require(msg.value == price, "Not enough balance to complete transaction");
    idToVaultItem[itemId].seller.transfer(msg.value); //money to Seller
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); //nft to buyer
    idToVaultItem[itemId].holder = payable(msg.sender); //change holder of NFT
    idToVaultItem[itemId].sold = true;
    _itemsSold.increment();
    //payable(holder).transfer(listingFee); //holder=owner(inconstructor)
  }

    //List of Available NFTs
  function getAvailableNft() public view returns (VaultItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    VaultItem[] memory items = new VaultItem[](unsoldItemCount); //size is equal to unsold items
    for (uint i = 0; i < itemCount; i++) { //all nfts check
      if (idToVaultItem[i + 1].holder == address(0)) {   //unsold items
        uint currentId = i + 1;
        VaultItem storage currentItem = idToVaultItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

    //Show My NFTs
  function getMyNft() public view returns (VaultItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToVaultItem[i + 1].holder == msg.sender) {
        itemCount += 1;
      }
    }

    VaultItem[] memory items = new VaultItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToVaultItem[i + 1].holder == msg.sender) {
        uint currentId = i + 1;
        VaultItem storage currentItem = idToVaultItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

    //showing user NFTs on sale
  function getMyMarketNfts() public view returns (VaultItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToVaultItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    VaultItem[] memory items = new VaultItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToVaultItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        VaultItem storage currentItem = idToVaultItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function withdraw() public payable onlyOwner() {
    require(payable(msg.sender).send(address(this).balance));
    }
}