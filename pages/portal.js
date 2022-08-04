import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Web3Modal from "web3modal";
import { useRouter } from 'next/router';
import Resell from '../engine/Resell.json';
import NFTCollection from '../engine/NFTCollection.json';
import NFT from '../engine/NFT.json';
import { Card, Button, Input, Col, Row, Spacer, Container, Text, Grid } from '@nextui-org/react';
import axios from 'axios';
import 'sf-font';
import Web3 from 'web3';
import {hhnft, hhresell, hhnftcol, mainnet, cipherHH, simpleCrypto  } from '../engine/configuration';


export default function Sell() {
    const [user, getUser] = useState([])
    const [created, getCreated] = useState([]);  // For user created NFTS
    const [resalePrice, updateresalePrice] = useState({ price: ''})
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
      connectUser();
      getWalletNFTs()
      getCreatedNFTs()
    }, [setNfts,getUser,getCreated])  //anytime this value changes it refreshes the page
    const router = useRouter()

    async function connectUser() {
        if (window.ethereum) {
          var web3 = new Web3(window.ethereum);
          await window.ethereum.send('eth_requestAccounts');
          var accounts = await web3.eth.getAccounts();
          var account = accounts[0];
        }
        getUser(account)
      }
    
      async function getWalletNFTs() {     // get Nfts in wallet and show them
        const provider = new ethers.providers.JsonRpcProvider(mainnet)
        const key = simpleCrypto.decrypt(cipherHH)
        const wallet = new ethers.Wallet(key, provider);
        const contract = new ethers.Contract(hhnftcol, NFTCollection, wallet);
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
        const provider = new ethers.providers.JsonRpcProvider(mainnet)
        const key = simpleCrypto.decrypt(cipherHH)
        const wallet = new ethers.Wallet(key, provider);
        const contract = new ethers.Contract(hhnft, NFT, wallet);   //NFTbyUser Contract
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






      if (loadingState === 'loaded' && !nfts.length) 
      return (
        <Container sm>
      <Row >
        <Col>
      <Text h3>No NFT's Found, Connect Wallet</Text>
      </Col>
      </Row>
      <Spacer></Spacer>
      </Container>
)
return (
    <div>
    <Container sm>
    <Row >
  <Col>
    <Text h4>NFT's in Wallet <Text h5 css={{color:'#39FF14'}}> {user}</Text></Text>
    <Row>
    <Button size="sm" onPress={connectUser} css={{marginRight:'$2', marginBottom:'$2'}}>Refresh Wallet</Button>
    <Button size="sm" onPress={getWalletNFTs} css={{marginRight:'$2', marginBottom:'$2'}}>Refresh NFTs</Button>
    </Row>
    </Col>
</Row>
  <Grid.Container gap={3}>
  {nfts.map((nft, i) => {
        var owner = user
        if (owner.indexOf(nft.wallet) !== -1) {
            async function executeRelist() {
                const { price } = resalePrice
                if (!price) return
                try {
                    relistNFT()
                } catch (error) {
                    console.log('Transaction Failed', error)
                }
            }
          async function relistNFT() {
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const signer = provider.getSigner()
            const price = ethers.utils.parseUnits(resalePrice.price, 'ether')
            const contractnft = new ethers.Contract(hhnftcol, NFTCollection, signer);
            await contractnft.setApprovalForAll(hhresell, true);
            let contract = new ethers.Contract(hhresell, Resell, signer)
            let listingFee = await contract.getListingFee()
            listingFee = listingFee.toString()
            let transaction = await contract.listSale(nft.tokenId, price, { value: listingFee })
            await transaction.wait()
            router.push('/')
        }
        return (
          <Grid >
            <a>
              <Card isHoverable key={i} css={{ mw: "200px", marginRight: '$1' }} variant="bordered">
                <Card.Image src={nft.img} />
                <Card.Body sm key={i}>
                <h3 style={{color:'#9D00FF',fontFamily:'SF Pro Display'}}>Owned by You</h3>
                  <Text h5 >{nft.name} Token-{nft.tokenId}</Text>
                  <Text>{nft.desc}</Text>
                  <Input size='sm'
                      css={{ marginTop: '$2', maxWidth:'120px', marginBottom:'$2', border:'$blue500'}}
                      style={{color:'white', fontFamily:'SF Pro Display', fontWeight:'bolder', fontSize:'15px'}}
                      placeholder="Set your price"
                      onChange={e => updateresalePrice({ ...resalePrice, price: e.target.value })}
                  />
                  <Button size="sm" color="gradient" onPress={executeRelist} style={{ fontSize: '20px' }}>Relist for Sale</Button>
                </Card.Body>
              </Card>
            </a>
          </Grid>
        )
      }})}
  </Grid.Container>

  </Container>
  <Spacer></Spacer>
  <Container md>
  <Text h4>Created NFT's in Wallet</Text>
  <Row>
  <Grid.Container justify="flex-start" gap={4}>
{created.map((nft, i) => {
  var owner = user
  if (owner.indexOf(nft.wallet) !== -1) {  //wallet owner = nft owner 
        return (
          <Grid>
            <a>
              <Card isHoverable key={i} css={{ mw: "200px", marginRight: '$1' }} variant="bordered">
                <Card.Image src={nft.img} />
                <Card.Body sm key={i}>
                <h3 style={{color:'#9D00FF',fontFamily:'SF Pro Display'}}>Owned by You</h3>
                  <Text h5 >{nft.name} Token-{nft.tokenId}</Text>
                  <Text>{nft.desc}</Text>
                </Card.Body>
              </Card>
            </a>
          </Grid>
        )
      }})}
  </Grid.Container>
  </Row>
  </Container>
  </div>
)
}