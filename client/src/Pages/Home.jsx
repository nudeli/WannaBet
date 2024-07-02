import { NavLink } from "react-router-dom";
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Wanna Bet?</h1>
            <p className="description">
                'Wanna Bet' is an app built on the blockchain that allows people to bet with friends on the future price of Bitcoin!
            </p>
            <p className="wallet-instruction">
                You'll first need a Metamask wallet connected to Polygon's Mumbai Testnet and funds.
            </p>
            {/* Insert your code for buttons here */}
            <div className="buttons-container">
                <NavLink to={"/CreateBet"} className="nav-button">
                    Create a New Bet
                </NavLink>
                <NavLink to={"/JoinBet"} className="nav-button">
                    Join a Bet
                </NavLink>
            </div>
        </div>
    );
}

export default Home;