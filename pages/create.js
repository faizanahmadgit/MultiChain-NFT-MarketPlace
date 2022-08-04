import { ethers } from 'ethers';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Web3Modal from "web3modal";
import NFT from '../engine/NFT.json';
import Market from '../engine/Market.json';
import { hhnft, hhmarket } from '../engine/configuration';
import { Card, Button, Input, Col, Row, Spacer, Container, Text, Grid } from '@nextui-org/react';
import { client } from '../engine/configuration'; //ipfs 
import 'sf-font';

export default function createMarket() {
    const [fileUrl, setFileUrl] = useState(null) //using usestate to get url of nft image
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })//only applicable to listing thats why price
    const router = useRouter()

    //function to upoad image on IPFS
    async function onChange(e) {
        const file = e.target.files[0]          //browse in your computer to select image
        try {
            const added = await client.add(             //add file in ipfs client
                file,               
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://gateway.pinata.cloud/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }
        //function to create Metadata and call createNFT() functon in frontend
    async function createMarket() {
        const { name, description, price } = formInput   //from html code taken from user
        if (!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({
            name, description, image: fileUrl    //image in fileurl
        })
        try {
            const added = await client.add(data)
            const url = `https://gateway.pinata.cloud/ipfs/${added.path}` //metadata or tokenuri path
            createNFT(url)                  //contract function call with tokenuri
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }
//create nft and list on sale
    async function createNFT(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(hhnft, NFT, signer) //NFTbyuser Contract
        let transaction = await contract.createNFT(url)        // Calling NFTbyUser contract function
        let tx = await transaction.wait()
        let event = tx.events[0]  
        let value = event.args[2]  //tokenID got from event
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether') //price given by user in html code
        contract = new ethers.Contract(hhmarket, Market, signer)        //marketplace of NFTbyUser contract
        let listingFee = await contract.getListingFee()
        listingFee = listingFee.toString()
        transaction = await contract.createVaultItem(hhnft, tokenId, price, { value: listingFee }) //putting on sale and paying
                                                                                                   //listingFee
        await transaction.wait()
        router.push('/')
    }
/////////FUCNTIONS TO BUY NFTbyUser and mint IN THE WALLET
    async function buyNFT() {
        const { name, description } = formInput   //only name and desc as not listing on MP
        if (!name || !description || !fileUrl) return
        const data = JSON.stringify({                       //3 lines are metadata generator, can build anything, point it to ipfs and make an nft
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://gateway.pinata.cloud/ipfs/${added.path}`
            mintNFT(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function mintNFT(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(hhnft, NFT, signer)
        let cost = await contract.cost()    //GET THE MINTING COST 
        let transaction = await contract.mintNFT(url, { value: cost })
        await transaction.wait()
        router.push('/portal')
    }

    return (
        <div>
          <Spacer></Spacer>
          <Container lg gap={2} css={{ fontFamily: 'SF Pro Display', fontWeight: '200' }}>
          <Text h2>NFT Creator Portal</Text>
            <Row gap={4}>
              <Col>
              <Spacer></Spacer>
              <Spacer></Spacer>
                <Spacer></Spacer>
                <Text h3 className='ml-3'>The NFT Marketplace with a Reward.</Text>
                <Text h3>N2DR IS More Than A Token</Text>
                <Spacer></Spacer>
                <img src='n2dr-logo.png' width={"300px"} />
              </Col>
              <Col css={{ marginRight: '$7' }}>
              <Spacer></Spacer>
                <Card css={{ marginTop: '$5', marginBottom: '$5' }}>
                  <Card.Body style={{ backgroundColor: "#00000040" }}>
                    <Text>Select your Preferred Network, Create your Amazing NFT by uploading your art using the simple NFT Dashboard. Simple!</Text>
                  </Card.Body>
                </Card>
                <img src='chainagnostic.png' />
                <Card css={{ marginTop: '$5' }} >
                  <Card.Body style={{ backgroundColor: "#00000040" }}>
                    <Text>Chain-Agnostic Marketplace that allows you to sell your NFT and accept your favorite crypto as payment! No borders, No restrictions. Simple!</Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
              <Spacer></Spacer>
                <Text h3>Create and Sell your NFT in the Marketplace</Text>
                <Card style={{ maxWidth: '300px', background: '#ffffff05', boxShadow: '0px 0px 5px #ffffff60' }}>
                  <Card css={{ marginTop: '$1' }}>
                    <Card.Body style={{ backgroundColor: "#000000" }}>
                    <Input
                    placeholder='Enter your NFT Name'
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })} //forminput in usestate, e is onchange above
                  />
                  </Card.Body>
                  </Card>
                  <Card >
                <Card.Body style={{ backgroundColor: "#000000" }}>
                  <Input
                    placeholder="NFT Description"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                  />
                </Card.Body>
              </Card>
              <Card>
                <Card.Body style={{ backgroundColor: "#000000" }}>
                  <input
                    type="file"                     //Getting image file from user
                    name="Asset"
                    onChange={onChange}
                  />
                  {
                    fileUrl && (
                      <img className="rounded " width="350" src={fileUrl} />
                    )
                  }
                </Card.Body>
              </Card>
              <Container css={{ marginBottom: '$2' }}>
                <Input
                  css={{ marginTop: '$2' }}
                  placeholder="Set your price in N2DR"
                  onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <Button size="sm" style={{ fontSize: '20px' }} onPress={createMarket} css={{ marginTop: '$2', marginBottom: '$5', color:'$gradient' }}>
                  List your NFT!
                </Button>
                <Button size="sm" style={{ fontSize: '20px' }} onPress={buyNFT} css={{ marginTop: '$2', marginBottom: '$5', color:'$gradient' }}>
                  Buy your NFT!
                </Button>
                </Container>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}