// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleContract{

    mapping(address => uint256) public balances;
    uint256 public totalAmount;

    function deposit() public payable{
      balances[msg.sender] += msg.value;
      totalAmount += msg.value; 
    }

    function withdraw() public {
        uint256 transferAmount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(transferAmount);
        totalAmount -= transferAmount;
    }

    function withdraw(uint256 withdrawAmount) public{
        require(balances[msg.sender] >= withdrawAmount, "Not enough funds");
        balances[msg.sender] -= withdrawAmount;
        totalAmount-=withdrawAmount;
        payable(msg.sender).transfer(withdrawAmount);
    }
}