import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";
import Accordion from "react-bootstrap/Accordion";
import Countdown, { zeroPad } from 'react-countdown';

import 'bootstrap/dist/css/bootstrap.min.css';

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const countdownDate = "2022-03-28T18:00:00.000+02:00";
  const countdownRenderer = ({ days, hours, minutes, seconds }) => {
    return <>
      <Col xs={3} md={3}>{zeroPad(days)}</Col>
      <Col xs={3} md={3}>{zeroPad(hours)}</Col>
      <Col xs={3} md={3}>{zeroPad(minutes)}</Col>
      <Col xs={3} md={3}>{zeroPad(seconds)}</Col>
    </>;
  };

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! Go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <>
      <Navbar style={{backgroundColor: "#000000" }}>
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="/config/images/logo.png"              
              height="30"
              className="d-inline-block align-top"
            />{' '}          
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">                           
            </Nav>
            <Nav>
            <StyledLink target={"_blank"} href="https://twitter.com/futurenftmints">
              <img
                alt=""
                src="/config/images/twitter.png"              
                height="30"
                className="d-inline-block align-top"  
                margin="10"            
              />{' '}&nbsp;&nbsp;
            </StyledLink>
            <StyledLink target={"_blank"} href="https://discord.gg/futurenftmints">
              <img
                alt=""
                src="/config/images/discord.png"              
                height="30"
                className="d-inline-block align-top"                           
              />{' '}&nbsp;&nbsp;&nbsp;
            </StyledLink> 
            {/* 
            <StyledLink target={"_blank"} href="https://discord.gg/futurenftmints">
              <img
                alt=""
                src="/config/images/opensea.png"              
                height="30"
                className="d-inline-block align-top"                           
              />{' '}&nbsp;&nbsp;&nbsp;
            </StyledLink> 
            */} 

            {/*
            { (blockchain.account !== "" && blockchain.smartContract !== null) ?
              <Button style={{ backgroundColor: "#F83700", border: "#F83700" }}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(connect());
                  getData();
                } }
              >
                Connect Wallet
              </Button> : null
            }     
            */} 

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid style={{ backgroundImage: "linear-gradient(#000000 10%, #A11692, #BD2164)" }}>
        <Row style={{ paddingTop: "50px", paddingBottom: "500px" }}>
          <Col md={1}></Col>
          <Col md={6}>
            <Row style={{ color: "#ffffff", fontSize:"3em"}}>
              <Col>Register your wallet</Col>
            </Row>
            <Row style={{ paddingTop: "40px", color: "#ffffff", fontSize:"2em", lineHeight: "1em" }}>
              <Col>To claim your subscription to the daily Future NFT Mints newsletter:</Col>
            </Row>
            <Row>                                                  
              <Row style={{ paddingTop:"25px", fontSize:"1.25em" }}>
                <Col xs={1} style={{ textAlign: "left", color: "#52F1EE" }}>1</Col>
                <Col style={{ color: "#ffffff" }}>Join our <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://discord.gg/futurenftmints">Discord</StyledLink> community</Col>
              </Row>       
              <Row style={{ paddingTop:"15px", fontSize:"1.25em" }}>
              <Col xs={1} style={{ textAlign: "left", color: "#52F1EE" }}>2</Col>
                <Col style={{ color: "#ffffff" }}>Verify your wallet via collab.land in the #collabland channel</Col>
              </Row>              
              <Row style={{ paddingTop:"15px", fontSize:"1.25em" }}>
                <Col xs={1} style={{ textAlign: "left", color: "#52F1EE" }}>3</Col>
                <Col style={{ color: "#ffffff" }}>Access the #register-nft channel after verifying</Col>
              </Row>  
              <Row style={{ paddingTop:"15px", fontSize:"1.25em" }}>
                <Col xs={1} style={{ textAlign: "left", color: "#52F1EE" }}>4</Col>
                <Col style={{ color: "#ffffff" }}>Complete the form</Col>
              </Row>                                  
            </Row>     
            <Row style={{ color: "#ffffff", fontSize:"1.25em", paddingTop: "25px"}}>
              <Col>Merch! 👕 Everyone who owns an NFT at the time of our snapshot on Mon, Apr 4, 2022 @ 12pm ET will be eligible for 1 Future NFT Mints Early Supporter’s T-shirt per NFT they own.                    </Col>
            </Row>
          </Col>
          <Col md={4}></Col>
          <Col md={1}></Col>          
        </Row>



        
        
      </Container>
      <Card.Footer style={{backgroundColor:"#000000", width:"100%"}}>
        <Row>
          <Col xs={8} md={10} style={{color:"#ffffff"}}>Copyright © <StyledLink style={{ color:"#fff", textDecoration:"underline"}} target={"_blank"} href="https://futurenftmints.com">Future NFT Mints</StyledLink> 2022 and beyond</Col>
          <Col xs={4} md={2} style={{textAlign:"right"}}>
            <StyledLink target={"_blank"} href="https://twitter.com/futurenftmints">
              <img
                alt=""
                src="/config/images/twitter.png"              
                height="20"
                className="d-inline-block align-top"  
                margin="10"            
              />{' '}&nbsp;&nbsp;
            </StyledLink>
            <StyledLink target={"_blank"} href="https://discord.gg/futurenftmints">
              <img
                alt=""
                src="/config/images/discord.png"              
                height="20"
                className="d-inline-block align-top"                           
              />{' '}
            </StyledLink> 
          </Col>
        </Row>
      </Card.Footer>

      </>
  );
}

export default App;
