import { ethers } from "ethers";
import { useState,useEffect } from 'react';
import DatePicker from 'react-datepicker';
import redstone from 'redstone-api';
import 'react-datepicker/dist/react-datepicker.css';
import "./Button.css";

function CreateBet({state}) { 

    const [betId,setBetId]=useState();
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [date, setDate] = useState(new Date());

    const createBet = async(event)=>{
        event.preventDefault();
        console.log(state);
        console.log(state.contract);
        const {contract}=state;
        console.log(contract);
        //console.log(contract.bets);
        const priceMatic = await redstone.getPrice("MATIC");
        //console.log(price.value); // latest price value for AR token (in USD)
        //console.log(price.timestamp); // the exact timestamp of the price
        var predictedPrice = document.querySelector("#predictedPrice").value;
        if (predictedPrice === '' || predictedPrice <= 0 || isNaN(predictedPrice)) {
            alert("please enter a valid value for the predicted price");
            return;
        }
        const guess = document.querySelector("#guess").value;
        console.log(date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        console.log(year);
        console.log(month)
        console.log(day)
        const amount = document.querySelector("#amount").value;
        if (amount === '' || amount <= 0 || isNaN(amount)) {
            alert("please enter a valid value for the amount you would like to bet");
            return;
        }
        // const valueInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        // let num = valueInWei.toString()
        // console.log(num)
        // //const betAmount = {value:valueInWei};
        // console.log(priceMatic.value)
        // const maticAmount = num / priceMatic.value;
        // const betAmount = {value:maticAmount};

        const valueInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        console.log(valueInWei.toString());

        const priceMaticWei = ethers.utils.parseUnits(priceMatic.value.toString(), 'ether');

        // To divide, you might want to multiply by a factor before dividing to maintain precision, especially if dealing with tokens
        // Adjust 'factor' based on the desired precision (e.g., 1e6 for microether precision)
        const factor = ethers.utils.parseUnits("1", 'ether'); // For maintaining precision during division
        const maticAmountBigNumber = valueInWei.mul(factor).div(priceMaticWei); // BigNumber division

        // If you need to send this as a value in a transaction
        const betAmount = {value: maticAmountBigNumber.toString()};

        const date2 = toUnixTime(year, month, day);        
        console.log(betAmount)
        //console.log(maticAmount)

        contract.on("BetPlaced", (betId, sender, guess, value ,event) => {
            let bigNumber = ethers.BigNumber.from(betId);
            let num = bigNumber.toString()
            console.log(num);
            setBetId(num);
            setIsBetPlaced(true);
        })

        const transaction = await contract.placeBet(predictedPrice,changeGuessToBool(guess),date2,betAmount)
        await transaction.wait();

        console.log(transaction);
        console.log("transaction is successful");
    }

    const toUnixTime = (year, month, day)=> {
        // Note: JavaScript months are 0-based (0 = January, 11 = December)
        var date3 = new Date(year, month - 1, day, 13, 59, 0);
        return Math.floor(date3.getTime() / 1000); // getTime() returns milliseconds, so divide by 1000
    }

    const changeGuessToBool = (guess)=> {
        if (guess === "Higher"){
            return true;
        }
        else if (guess === "Lower"){
            return false;
        }
    }
    
    return <div className="container">
        <h1>CREATE A BET</h1>
        <p className="description">
            Please fill in the information below to create a bet.
        </p><br></br>
        <div className="form-container">
            <form onSubmit={createBet}>
                <label for="predictedPrice">Predicted Price $USD</label>
                <input id="predictedPrice"></input><br></br>
                <label for="guess">Guess </label>
                <select id="guess" name="guess">
                    <option value="Higher">Higher</option>
                    <option value="Lower">Lower</option>
                </select><br></br>
                <label for="date">Date </label>
                <DatePicker selected={date} onChange={(date) => setDate(date)}  minDate={new Date()}/><br></br>
                <label for="amount">Bet Amount in MATIC </label>
                <input id="amount"></input><br></br>
                <button class="button">Make Bet</button>
            </form>
        </div>
        
        <div className="betId">
            {isBetPlaced ? (<p>Bet placed! Share this code with your friend to join the bet: {betId}</p>) : (<p>The bet code will appear here a one minute after you click 'Make Bet'.</p>)}
        </div>
        <p className="info">
            All bets must be made using the MATIC token.
        </p><br></br>
    </div>
}

export default CreateBet;