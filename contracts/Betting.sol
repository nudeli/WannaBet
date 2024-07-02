// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Betting {
    struct Bet {
        address payable bettor;  // Address of the user who made the bet
        uint guess;              // The guessed number
        uint256 amount;          // Amount of cryptocurrency staked
        bool isActive;           // Flag to check if the bet is active
        address payable opponent; // Address of the opponent who joins the bet
        uint opponentGuess;      // The guessed number by the opponent
        uint time;               // Time when the bet was placed or joined
    }

    address public owner;              // Owner of the contract
    mapping(uint => Bet) public bets;  // Mapping to store bets
    uint public nextBetId;             // Counter for unique bet IDs
    uint public lockTime;              // Time to lock the bets

    event BetPlaced(uint betId, address bettor, uint guess, uint256 amount);
    event BetJoined(uint betId, address opponent, uint opponentGuess);
    event BetSettled(uint betId, address winner, uint winningNumber);

    constructor(uint _lockTime) {
        owner = msg.sender; // Set the contract deployer as the owner
        lockTime = _lockTime; // Set the lock time for bets
        nextBetId = 0; // Initialize the nextBetId counter
    }

    function placeBet(uint _guess) external payable returns (uint){
        require(_guess >= 0 && _guess <= 100, "Guess must be between 0 and 100");
        require(msg.value > 0, "Bet amount must be greater than 0");

        uint betId = nextBetId++;
        bets[betId] = Bet(payable(msg.sender), _guess, msg.value, true, payable(address(0)), 0, block.timestamp);
        emit BetPlaced(betId, msg.sender, _guess, msg.value);

        return betId;
    }

    function joinBet(uint _betId, uint _guess) external payable {
        Bet storage bet = bets[_betId];
        require(bet.isActive, "Bet is not active");
        require(bet.bettor != msg.sender, "Bettor cannot join their own bet");
        require(bet.opponent == address(0), "Bet already has an opponent");
        require(msg.value == bet.amount, "Joining amount must match the bet amount");

        bet.opponent = payable(msg.sender);
        bet.opponentGuess = _guess;
        bet.time = block.timestamp; // Update the timestamp when the bet is joined
        emit BetJoined(_betId, msg.sender, _guess);
    }

    function settleBet(uint _betId) external {
        Bet storage bet = bets[_betId];
        require(bet.isActive, "Bet is not active");
        require(block.timestamp >= bet.time + lockTime, "Bet is still locked");

        uint winningNumber = random();

        uint bettorDifference = absDifference(winningNumber, bet.guess);
        uint opponentDifference = absDifference(winningNumber, bet.opponentGuess);

        address payable winner;
        bool isTie = false;

        if (bettorDifference < opponentDifference) {
            winner = bet.bettor;
        } else if (bettorDifference > opponentDifference) {
            winner = bet.opponent;
        } else {
            isTie = true;
        }

        if (!isTie) {
            winner.transfer(bet.amount * 2); // Winner gets the combined amount
        } else {
            // Refund both bettors in case of a tie
            bet.bettor.transfer(bet.amount);
            bet.opponent.transfer(bet.amount);
        }

        bet.isActive = false;
        emit BetSettled(_betId, winner, winningNumber);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 101;
    }

    function absDifference(uint a, uint b) private pure returns (uint) {
        if (a >= b) return a - b;
        return b - a;
    }
}
