//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

contract Bitcoin is MainDemoConsumerBase {
    struct Bet {
        address payable bettor;       // Address of the user who made the bet
        uint256 predictedPrice;       // Predicted price of Bitcoin at future time
        bool bettorGuessIsHigher;     // Bettor's guess if future price is higher
        uint256 amount;               // Amount of cryptocurrency staked
        bool isActive;                // Flag to check if the bet is active
        address payable opponent;     // Address of the opponent who joins the bet
        uint256 betExpiration;        // Future time when bet expires
    }

    address public owner;              // Owner of the contract
    mapping(uint => Bet) public bets;  // Mapping to store bets
    uint public nextBetId;             // Counter for unique bet IDs

    event BetPlaced(uint betId, address bettor, uint256 predictedPrice, bool bettorGuessIsHigher, uint256 amount, uint256 betExpiration);
    event BetJoined(uint betId, address opponent);
    event BetSettled(uint betId, address winner, uint256 currentPrice, uint256 predictedPrice);

    constructor() {
        owner = msg.sender;
        nextBetId = 0;
    }

    function placeBet(uint256 _predictedPrice, bool _bettorGuessIsHigher, uint256 _betExpiration) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(_betExpiration > block.timestamp, "Expiration time must be in the future");

        uint betId = nextBetId++;
        bets[betId] = Bet(payable(msg.sender), _predictedPrice, _bettorGuessIsHigher, msg.value, true, payable(address(0)), _betExpiration);
        emit BetPlaced(betId, msg.sender, _predictedPrice, _bettorGuessIsHigher, msg.value, _betExpiration);
    }

    function joinBet(uint _betId) external payable {
        Bet storage bet = bets[_betId];
        require(bet.isActive, "Bet is not active");
        require(bet.bettor != msg.sender, "Bettor cannot join their own bet");
        require(bet.opponent == address(0), "Bet already has an opponent");
        require(msg.value == bet.amount, "Joining amount must match the bet amount");

        bet.opponent = payable(msg.sender);
        emit BetJoined(_betId, msg.sender);
    }

    function settleBet(uint _betId, uint price) external {
        Bet storage bet = bets[_betId];
        require(bet.isActive, "Bet is not active");
        require(block.timestamp >= bet.betExpiration, "Bet has not yet expired");

        bool currentPriceIsHigher = price >= bet.predictedPrice;

        address payable winner;
        if ((currentPriceIsHigher && bet.bettorGuessIsHigher) || (!currentPriceIsHigher && !bet.bettorGuessIsHigher)) {
            winner = bet.bettor;
        } else {
            winner = bet.opponent;
        }

        winner.transfer(bet.amount * 2); // Winner gets the combined amount
        bet.isActive = false;
        emit BetSettled(_betId, winner, price, bet.predictedPrice);
    }

    function checkBetsReadyForSettlement() external view returns (uint[] memory) {
    uint[] memory readyBets = new uint[](nextBetId);
    uint count = 0;

    for (uint i = 0; i < nextBetId; i++) {
        if (bets[i].isActive && block.timestamp >= bets[i].betExpiration) {
            readyBets[count] = i;
            count++;
        }
    }

    // Copy the ready bets into a smaller array of the correct size
    uint[] memory readyBetsTrimmed = new uint[](count);
    for (uint j = 0; j < count; j++) {
        readyBetsTrimmed[j] = readyBets[j];
    }

    return readyBetsTrimmed;
}


    function getLatestBtcPrice() public view returns (uint256) {
        bytes32 dataFeedId = bytes32("BTC");
        return getOracleNumericValueFromTxMsg(dataFeedId);
   }
}