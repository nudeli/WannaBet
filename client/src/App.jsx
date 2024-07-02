import { useState,useEffect } from 'react';
import abi from "./contractJson/Bitcoin.json";
import {ethers} from "ethers";
import './App.css';
import { BrowserRouter } from "react-router-dom";
import Pages from './Pages/Pages';
import { WrapperBuilder } from "@redstone-finance/evm-connector";
import BackgroundImagePage from './components/BackgroundImagePage';

function App() {
  const [state,setState]=useState({
    provider:null,
    signer:null,
    contract:null
  })

  const appStyle = {
    backgroundImage: "url('background.png')",
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh' // Ensures the background covers the whole viewport height
  };

  const [account,setAccount]=useState('Not connected');
  useEffect(()=>{
    const template=async()=>{
   
      //const contractAddres="0x4D8ec41B11aa0e21c998C53D1D43A72BCCf0Fe00";
      //const contractAddres="0x088ebc80eD1247Aba90e369431C3969773c40C4E";
      const contractAddres = "0xf3ff29c27Ad8ED0459245E833eB7692C4146D8Cb";
      const contractABI=abi.abi;
      //Metamask part
      //1. In order do transactions on goerli testnet
      //2. Metmask consists of infura api which actually help in connectig to the blockhain
      try{

        const {ethereum}=window;
        const account = await ethereum.request({
          method:"eth_requestAccounts"
        })
 
        window.ethereum.on("accountsChanged", ()=>{
          window.location.reload()
        })
        setAccount(account);
        const provider = new ethers.providers.Web3Provider(ethereum);//read the Blockchain
        const signer =  provider.getSigner(); //write the blockchain
        
        const contract = new ethers.Contract(
          contractAddres,
          contractABI,
          signer
        );

        const wrappedContract = WrapperBuilder.wrap(contract).usingDataService(
          {
            dataFeeds: ["ETH", "BTC"],
          },
        );

        // console.log(wrappedContract);
        // const hexValue = await wrappedContract.getLatestBtcPrice();
        // console.log("here");
        // console.log(hexValue);
        // console.log(convertHexToEthPrice(hexValue));
        // console.log(contract);
        setState({provider,signer,contract});
       
      }catch(error){
        console.log(error)
      }
    }
    template();
  },[])

  function convertHexToEthPrice(hexValue) {
    // Convert the hexadecimal value to a BigNumber
    const weiValue = ethers.BigNumber.from(hexValue);
    var decimalNumber = Number(hexValue);
    console.log(decimalNumber);

    // Convert the value from wei to ether
    const ethPrice = ethers.utils.formatUnits(decimalNumber,12);

    return ethPrice;
}


  return (
    <>
      <div className='App' style={appStyle}>
        <BrowserRouter>
          {/* <h3>Connected Account: {account} </h3> */}
          <Pages state={state} />
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
