import { ethers } from "ethers";
import { useState } from "react";
import "./Button.css";

function JoinBet({state}) { 

    const [isBetJoined, setIsBetJoined] = useState(false);

    const joinBet = async(event)=>{
        event.preventDefault();
        console.log(state.contract);
        const {contract}=state;
        console.log(contract.bets);
        const betId = document.querySelector("#betId").value;
        const amount = document.querySelector("#amount").value;
        const valueInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        const betAmount = {value:valueInWei}
        console.log(betAmount)
        const transaction = await contract.joinBet(betId,betAmount)
        await transaction.wait()
        console.log("transaction is successful");
        setIsBetJoined(true);
    }
    return <>
        <h1>JOIN A BET</h1>
        <p className="description">
            To join a bet insert the bet code and confirm the amount you would like to bet.
        </p><br></br>
        <div className="form-container">
            <form onSubmit={joinBet}>
                <label for="BetId">Bet Code </label>
                <input id="betId"></input><br></br>
                <label for="amount">Bet Amount in MATIC </label>
                <input id="amount"></input><br></br>
                <button class="button">Join Bet</button>
            </form>
        </div>

        <div >
            {isBetJoined ? (<p>Status: Bet has been joined successfully!</p>) : (<p>Status: Bet not joined</p>)}
        </div>
    </>
}

export default JoinBet;