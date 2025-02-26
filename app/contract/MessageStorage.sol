// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MessageStorage {
    struct Message {
        address sender;
        string text;
        uint256 timestamp;
    }

    Message[] public messages;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Function to send ETH and store a message
    function pay(string memory _text) public payable {
        require(msg.value > 0, "Must send some ETH");
        messages.push(Message(msg.sender, _text, block.timestamp));
    }

    // Function to retrieve all stored messages
    function getAllMessages() public view returns (Message[] memory) {
        return messages;
    }

    // Function to withdraw ETH (only owner)
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    // Function to check contract balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}