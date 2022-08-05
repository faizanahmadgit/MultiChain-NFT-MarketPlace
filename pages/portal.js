import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Web3Modal from "web3modal";
import { useRouter } from 'next/router';
import Resell from '../engine/Resell.json';
import NFTCollection from '../engine/NFTCollection.json';
import NFT from '../engine/NFT.json';
import { polyTest, ethTest, bscTest } from '../engine/chainchange'; //functions of different chains
import { Card, Button, Input, Col, Row, Spacer, Container, Text, Grid, StyledRadioGroupContainer } from '@nextui-org/react';
import axios from 'axios';
import 'sf-font';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';     // to detect chainid of metamask wallet
import { mmnft, mmresell, mmnftcol, mmrpc } from '../engine/configuration';
import { goenft, goeresell, goenftcol, goerpc } from '../engine/configuration'; //for Rinkeby contracts
import { hhnft, hhresell, hhnftcol, hhrpc } from '../engine/configuration';
import { bsctnft, bsctresell, bsctnftcol, bsctrpc } from '../engine/configuration'; //for bsctestnet contracts
import { cipherHH,cipherEth, simpleCrypto  } from '../engine/configuration';

export default function Sell() {
  const [user, getUser] = useState([])
  const [chain, getChainName] = useState([])  //blockchain, user connected to
  const [rpc, getRpc] = useState([])          //if user decide to change blockchain
  const [nftcol, getNftCol] = useState([])      //will update SC according to blockchain chosen
  const [nftcustom, getNftCustom] = useState([])  //will update SC according to blockchain chosen
  const [nftresell, getNftResell] = useState([])  //will update SC according to blockchain chosen
  const [created, getCreated] = useState([])      
  const [resalePrice, updateresalePrice] = useState({ price: ''})
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
      getChain()
      setRpc()
      // connectUser();
      // getWalletNFTs()
      // getCreatedNFTs()
    }, [setNfts,getUser,getCreated])  //anytime this value changes it refreshes the page
    const router = useRouter()
      //to check the provider
    async function setRpc(){   
      var hh = "0x7a69";
      var goe = "0x4"; //for Rinkeby
      var mm = "0x13881";
      var bsct = "0x61";
      const connected = await detectEthereumProvider(); //will tell what chain user wallet connected to
      if (connected.chainId == hh) {
        var mainnet = hhrpc
      }
      else if (connected.chainId == goe) {
        var mainnet = goerpc
      }
      else if (connected.chainId == mm) {
        var mainnet = mmrpc
      }
      else if (connected.chainId == bsct) {
        var mainnet = bsctrpc
      }
      getRpc(mainnet); //will store provider in 'rpc' to user down
      console.log(mainnet)
      setNftCol();    //calling next func to adjust nftcollection contract addresses acc to blockchain
    }

    async function setNftCol(){
      var hh = "0x7a69";
      var goe = "0x4";    //for Rinkeby
      var mm = "0x13881";
      var bsct = "0x61";
      const connected = await detectEthereumProvider();
      if (connected.chainId == hh) {
        var nftcol = hhnftcol
      }
      else if (connected.chainId == goe) {
        var nftcol = goenftcol
      }
      else if (connected.chainId == mm) {
        var nftcol = mmnftcol
      }
      else if (connected.chainId == bsct) {
        var nftcol = bsctnftcol
      }
      getNftCol(nftcol); // set contract address in nftcol
      console.log(nftcol)
      setNftCustom();  //calling next func to adjust nftbyfaizi contract addresses acc to blockchain
    }
    async function setNftCustom(){
      var hh = "0x7a69";
      var goe = "0x4";    //For Rinkeby
      var mm = "0x13881";
      var bsct = "0x61";
      const connected = await detectEthereumProvider();
      if (connected.chainId == hh) {
        var nft = hhnft
      }
      else if (connected.chainId == goe) {
        var nft = goenft
      }
      else if (connected.chainId == mm) {
        var nft = mmnft
      }
      else if (connected.chainId == bsct) {
        var nft = bsctnft
      }
      getNftCustom(nft);  //saving in nftcustom
      console.log(nft)
      setNftResell(); //calling next func to adjust MPResell contract
    }
    

    async function setNftResell(){
      var hh = "0x7a69";
      var goe = "0x4";      //for rinkeby
      var mm = "0x13881";
      var bsct = "0x61";
      const connected = await detectEthereumProvider();
      if (connected.chainId == hh) {
        var nftresell = hhresell
      }
      else if (connected.chainId == goe) {
        var nftresell = goeresell
      }
      else if (connected.chainId == mm) {
        var nftresell = mmresell
      }
      else if (connected.chainId == bsct) {
        var nftresell = bsctresell
      }
      getNftResell(nftresell);
      console.log(nftresell)
    }
/////No need of userMP contract in Portal, so


//to get the correct chain name
async function getChain(){
  var hh = "0x7a69";
  var goe = "0x4";
  var mm = "0x13881";
  var bsct = "0x61";
  const connected = await detectEthereumProvider(); // gets the blockchain, user wallet connected to
  if (connected.chainId == hh) {
    var chainname = "HardHat"
  }
  else if (connected.chainId == goe) {
    var chainname = "Rinkeby Testnet"
  }
  else if (connected.chainId == mm) {
    var chainname = "Mumbai Testnet"
  }
  else if (connected.chainId == bsct) {
    var chainname = "BSC Testnet"
  }
  getChainName(chainname);
  console.log(chainname)
}

    async function connectUser() {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      console.log(signer);
      if (window.ethereum) {
        var web3 = new Web3(window.ethereum);
        await window.ethereum.send("eth_requestAccounts");
        var accounts = await web3.eth.getAccounts();
        var account = accounts[0];
      }
      getUser(account);
      }
    
      async function getWalletNFTs() {     // get Nfts in wallet and show them
          var address = nftcol; //from usestate
          var network = rpc;    //from usestate
        const provider = new ethers.providers.JsonRpcProvider(network)  //will use network as per rpc from blockhchain
        const key = simpleCrypto.decrypt(cipherHH)
        const wallet = new ethers.Wallet(key, provider);
        const contract = new ethers.Contract(address, NFTCollection, wallet); //will use address as per blockchain
        const itemArray = [];
        contract.totalSupply().then(result => {
          for (let i = 0; i < result; i++) {
            var token = i + 1                         
            const owner = contract.ownerOf(token).catch(function (error) {
                console.log("tokens filtered");
              });
            const rawUri = contract.tokenURI(token).catch(function (error) {
                console.log("tokens filtered");
              });
            const Uri = Promise.resolve(rawUri)
            const getUri = Uri.then(value => {
              //var cleanUri = value.replace('ipfs://', 'https://ipfs.io/ipfs/')
              let metadata = axios.get(value).catch(function (error) {
                console.log(error);
              });
              return metadata;
            })
            getUri.then(value => {
              let rawImg = value.data.image
              var name = value.data.name
              var desc = value.data.description
              let image = rawImg.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              Promise.resolve(owner).then(value => {
                let ownerW = value;
                let meta = {
                  name: name,
                  img: image,
                  tokenId: token,
                  wallet: ownerW,
                  desc,
                }
                console.log(meta)
                itemArray.push(meta)
              })
            })
          }
        })
        await new Promise(r => setTimeout(r, 3000));
        setNfts(itemArray)
        setLoadingState('loaded');
      }

      async function getCreatedNFTs() {
        var address = nftcustom
        var network = rpc
        const provider = new ethers.providers.JsonRpcProvider(network) //rpc got from above
        const key = simpleCrypto.decrypt(cipherHH)
        const wallet = new ethers.Wallet(key, provider);
        const contract = new ethers.Contract(address, NFT, wallet);   //NFTbyUser Contract
        const itemArray = [];
        contract._tokenIds().then(result => {      //instead of total supply, show tokenId, as incrementing with every mint
          for (let i = 0; i < result; i++) {        // check all nfts minted,
            var token = i + 1                         
            const owner = contract.ownerOf(token).catch(function (error) { //but only show nfts,owner of token should match wallet connected
                console.log("tokens filtered");
              });
            const rawUri = contract.tokenURI(token).catch(function (error) {
                console.log("tokens filtered");
              });
            const Uri = Promise.resolve(rawUri)
            const getUri = Uri.then(value => {
              //var cleanUri = value.replace('ipfs://', 'https://ipfs.io/ipfs/')
              let metadata = axios.get(value).catch(function (error) {
                console.log(error.toJSON());
              });
              return metadata;
            })
            getUri.then(value => {
              let rawImg = value.data.image
              var name = value.data.name
              var desc = value.data.description
              let image = rawImg.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              Promise.resolve(owner).then(value => {
                let ownerW = value;
                let meta = {
                  name: name,
                  img: image,
                  tokenId: token,
                  wallet: ownerW,
                  desc,
                }
                console.log(meta)
                itemArray.push(meta)
              })
            })
          }
        })
        await new Promise(r => setTimeout(r, 3000));
        getCreated(itemArray)   // storing in usestate
        setLoadingState('loaded');
      }

      /////two new functions to refresh state
      async function refreshNFTs(){
        connectUser();
        setRpc();
        getCreatedNFTs();
        getWalletNFTs();
        getChain();
      }

      async function connectWallet(){
        connectUser();
        setRpc();
        getChain();
      }

      if (loadingState === 'loaded' && !nfts.length) 
      return (
        <Container sm>
      <Row >
        <Col>
      <Text h3>No NFT's Found, Connect Wallet</Text>
      <Button
          size="sm"
          color="gradient"
          onPress={refreshNFTs}
          style={{ fontSize: "20px" }}
        >
          Refresh
        </Button>
      </Col>
      </Row>
      <Spacer></Spacer>
      </Container>
)
return (
    <div>
    <Container md>
    <Row>
        <Col css={{ size: "$50", paddingLeft: "$10", paddingTop: "$4" }}>
          <Card css={{ p: "$9", backgroundColor: "$blue200" }}>
          <Row>
          <Text h4 css={{marginRight:'$3'}}>
              Switch Blockchain
            </Text>
          <Button size="sm" onPress={polyTest} css={{ marginRight: "$2" }}>
                <img src="polygonwhite.png" width={"100px"} />
              </Button>
              <Button size="sm" onPress={bscTest} css={{ marginRight: "$2" }}>
                <img src="bsc.png" width={"100px"} />
              </Button>
              <Button size="sm" onPress={ethTest}>
                <img src="ethereumlogo.png" width={"100px"} />
              </Button>
              </Row>
              <Card css={{ p: "$4", marginTop:'$3'}}>
            <Text h3>
              Wallet
              <Text h5 css={{ color: "#39FF14" }}>
                {user}
              </Text>
            </Text>
            <Text h6>Selected Chain: {chain}</Text>
            <Row>
            <Button
                size="sm"
                color="gradient"
                onPress={connectWallet}
                style={{ fontSize: "20px", marginRight:'4px' }}
              >
               Connect
              </Button>
              <Button
                size="sm"
                color="gradient"
                onPress={refreshNFTs}
                style={{ fontSize: "20px" }}
              >
                Refresh
              </Button>
            </Row>
            </Card>
          </Card>
        </Col>
      </Row>
      <Row>
        <Grid.Container gap={3}>
          {nfts.map((nft, i) => {
            var owner = user;
            if (owner.indexOf(nft.wallet) !== -1) {
              async function executeRelist() {
                const { price } = resalePrice;
                if (!price) return;
                try {
                  relistNFT();
                } catch (error) {
                  console.log("Transaction Failed", error);
                }
              }
              async function relistNFT() {
                var resell = nftresell
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                const price = ethers.utils.parseUnits(
                  resalePrice.price,
                  "ether"
                );
                const contractnft = new ethers.Contract(
                  nftcol,
                  NFTCollection,
                  signer
                );
                await contractnft.setApprovalForAll(resell, true);
                let contract = new ethers.Contract(resell, Resell, signer);
                let listingFee = await contract.getListingFee();
                listingFee = listingFee.toString();
                let transaction = await contract.listSale(nft.tokenId, price, {
                  value: listingFee,
                });
                await transaction.wait();
                router.push("/");
              }
              return (
                <Grid>
                  <a>
                    <Card
                      isHoverable
                      key={i}
                      css={{ mw: "200px", marginRight: "$1" }}
                      variant="bordered"
                    >
                      <Card.Image src={nft.img} />
                      <Card.Body sm key={i}>
                        <h3
                          style={{
                            color: "#9D00FF",
                            fontFamily: "SF Pro Display",
                          }}
                        >
                          Owned by You
                        </h3>
                        <Text h5>
                          {nft.name} Token-{nft.tokenId}
                        </Text>
                        <Text>{nft.desc}</Text>
                        <Input
                          size="sm"
                          css={{
                            marginTop: "$2",
                            maxWidth: "120px",
                            marginBottom: "$2",
                            border: "$blue500",
                          }}
                          style={{
                            color: "white",
                            fontFamily: "SF Pro Display",
                            fontWeight: "bolder",
                            fontSize: "15px",
                          }}
                          placeholder="Set your price"
                          onChange={(e) =>
                            updateresalePrice({
                              ...resalePrice,
                              price: e.target.value,
                            })
                          }
                        />
                        <Button
                          size="sm"
                          color="gradient"
                          onPress={executeRelist}
                          style={{ fontSize: "20px" }}
                        >
                          Relist for Sale
                        </Button>
                      </Card.Body>
                    </Card>
                  </a>
                </Grid>
              );
            }
          })}
        </Grid.Container>
      </Row>
    </Container>
    <Spacer></Spacer>
    <Container md>
      <Text h4>Personal NFTs</Text>
      <Row>
        <Grid.Container justify="flex-start" gap={3}>
          {created.map((nft, i) => {
            var owner = user;
            if (owner.indexOf(nft.wallet) !== -1) {
              return (
                <Grid>
                  <a>
                    <Card
                      isHoverable
                      key={i}
                      css={{ mw: "200px", marginRight: "$1" }}
                      variant="bordered"
                    >
                      <Card.Image src={nft.img} />
                      <Card.Body sm key={i}>
                        <h3
                          style={{
                            color: "#9D00FF",
                            fontFamily: "SF Pro Display",
                          }}
                        >
                          Owned by You
                        </h3>
                        <Text h5>
                          {nft.name} Token-{nft.tokenId}
                        </Text>
                        <Text>{nft.desc}</Text>
                      </Card.Body>
                    </Card>
                  </a>
                </Grid>
              );
            }
          })}
        </Grid.Container>
      </Row>
    </Container>
  </div>
)
}