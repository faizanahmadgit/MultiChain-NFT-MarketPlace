/* 
       ___  ___    _  _  ___  _____   __  __             _         _   
 _ _  |_  )|   \  | \| || __||_   _| |  \/  | __ _  _ _ | |__ ___ | |_ 
| ' \  / / | |) | | .` || _|   | |   | |\/| |/ _` || '_|| / // -_)|  _|
|_||_|/___||___/  |_|\_||_|    |_|   |_|  |_|\__,_||_|  |_\_\\___| \__|
                                                                    
Update values accordingly
xxnft is the NFT SmartContract Address
xxmarket is the NFT MarketPlace Address
xxresell is the NFT MarketResell Address
xxnftcol is the already create NFT Collection Address
*/

/*
Private Key Encryption
Replace ethraw with your private key "0xPRIVATEKEY" (Ethereum and other EVM)
Replace hhraw with your private key "0xPRIVATEKEY" (Hardhat)
*/

import SimpleCrypto from "simple-crypto-js"
const cipherKey = "#ffg3$dvcv4rtkljjkh38dfkhhjgt"
const ethraw = "0x8207b7bbf486039b455923a402560ed041ad4b7243e9f329d6e415c00aaa9ef2";   //for eth,bsc and poly blockchain
const hhraw = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";    // for interaction on hardhat
export const simpleCrypto = new SimpleCrypto(cipherKey)                                   
export const cipherEth = simpleCrypto.encrypt(ethraw)                         //will use encryption of private key during func call
export const cipherHH = simpleCrypto.encrypt(hhraw)


/*
IPFS API DETAILS
 */
import {create as ipfsHttpClient} from 'ipfs-http-client';
export const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0'); //IPFS API INFURA
//send File to ipfs and grab CID and use as tokenuri


/*
HardHat Testnet
*/

export var hhresell = "0x261D8c5e9742e6f7f1076Fa1F560894524e19cad";
export var hhnftcol = "0x057ef64E23666F000b34aE31332854aCBd1c8544";
export var hhnft    = "0xcf27F781841484d5CF7e155b44954D7224caF1dD";           //NFTbyUser 
export var hhmarket = "0xe4EB561155AFCe723bB1fF8606Fbfe9b28d5d38D";           //Marketplace for listing NFTbyUser and minting diffrently
var hhrpc = "http://localhost:8545"; //"http://node.a3b.io:";
//var hhrpc = "https://rpc.ankr.com/eth_rinkeby"
/*
Global Parameters
*/
export var mainnet = hhrpc