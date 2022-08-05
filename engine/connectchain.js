import { bscChain, polyChain, ethChain, hardChain, bscTest, ethTest, polyTest } from '../engine/chainchange';
import 'sf-font';
import { Col, Dropdown } from '@nextui-org/react';
import React from 'react';
import { useEffect } from 'react';

export default function ConnectChain() {
    const [selected, setSelected] = React.useState(new Set(["Set Network"])); //store user input chain
    const selectedValue = React.useMemo(                                      //to use in enablechain func      
      () => Array.from(selected).join(", ").replaceAll("_", " "),
      [selected]
    );

    ///////////Show logos inside button, called at line 114
    const blockImage = React.useMemo(() => {
        var eth = "Ethereum";
        var bsc = "Binance Smart Chain";
        var pol = "Polygon";
        var mum = "Mumbai";
        var bsct = "Bsctest";
        var rink = "Rinkeby";
        var hard = "Hardhat";
        var init = "Set Network";
        if (selectedValue == eth) {
            return(
              <img src='./ethereumlogo.png' width={"160px"}/>
            )
        }
        else if (selectedValue == bsc) {
          return(
            <img src='./bsc.png' width={"160px"}/>
          )
        }
        else if (selectedValue == pol) {
          return(
            <img src='./polygonwhite.png' width={"160px"}/>
          )
        }
        else if (selectedValue == mum) {
            return(
              <h3>Mumbai Testnet</h3>
            )
          }
        else if (selectedValue == bsct) {
            return(
                <h3>BSC Testnet</h3>
            )
          }
        else if (selectedValue == rink) {
            return(
                <h3>Rinkeby Testnet</h3>
            )
          }
        else if (selectedValue == hard) {
            return(
                <h3>Hardhat Node</h3>
            )
          }
        else if (selectedValue == init) {
            return(
                <div className='mt-4'>
                <h3>Select Network</h3>
                </div>
            )
          }
      })

    ///////////will enable selected chain
    async function enableChain() {
        var bsc = "Binance Smart Chain";
        var poly = "Polygon";
        var eth = "Ethereum";
        var mum = "Mumbai";
        var bsct = "Bsctest";
        var rink = "Rinkeby";
        var hard = "Hardhat";
        if (bsc == selectedValue) {
          bscChain();                           //calling func from chainchange.js
        } else if (poly == selectedValue) {
          polyChain();
        } else if (eth == selectedValue) {
          ethChain();
        } else if (hard == selectedValue) {
          hardChain();
        } else if (bsct == selectedValue) {
          bscTest();
        } else if (rink == selectedValue) {
          ethTest();
        } else if (mum == selectedValue) {
          polyTest();
        }
      }
      useEffect(() => {
        enableChain();
      }, [selected]);


return (
    <Col css={{ marginTop: "$6" }}>
      <Dropdown>
        <Dropdown.Button
        aria-label='Connect Wallet'
          flat
          style={{
            background: "#00000070",
            boxShadow: "0px 0px 4px #ffffff",
            fontFamily: "SF Pro Display",
            fontWeight: "500",
            color: "white",
            fontSize: "20px",
          }}
          css={{ tt: "capitalize" }}
        >
        {blockImage}     
        </Dropdown.Button>
        <Dropdown.Menu
              css={{ 
              backgroundColor:'#ffffff30'
            }}
          aria-label="Single selection actions"
          color="secondary"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selected}               //usestate, to store what user clicked (key from down)
          onSelectionChange={setSelected}       //
          textValue={selected}
        > 
          <Dropdown.Item textValue="Ethereum" key="Ethereum">   
            <img src="ethereumlogo.png" width={"110px"} />
          </Dropdown.Item>
          <Dropdown.Item
            textValue="Binance Smart Chain"
            key="Binance Smart Chain"
          >
            <img src="bsc.png" width={"110px"} />
          </Dropdown.Item>
          <Dropdown.Item textValue="Polygon" key="Polygon">
            <img src="polygonwhite.png" width={"110px"} />
          </Dropdown.Item>
          <Dropdown.Item textValue="Hardhat" key="Hardhat">
            HardHat Node
          </Dropdown.Item>
          <Dropdown.Item textValue="Rinkeby" key="Rinkeby">
            Rinkeby TestNet
          </Dropdown.Item>
          <Dropdown.Item textValue="Bsctest" key="Bsctest">
            BSC TestNet
          </Dropdown.Item>
          <Dropdown.Item textValue="Mumbai" key="Mumbai">
            Mumbai TestNet
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Col>
  );
}