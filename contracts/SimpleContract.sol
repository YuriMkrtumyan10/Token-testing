// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleContract{

    mapping(address => uint256) public balances;
    uint256 public totalAmount;
    // Separate storage for events
    event Deposit(address indexed user, uint256 amount);
    event withdraw(address indexed user, uint256 amount);

    function deposit() public payable{
      balances[msg.sender] += msg.value;
      totalAmount += msg.value; 
      emit Deposit(msg.sender, msg.value);
    }

    function withdraw1() public {
        uint256 transferAmount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(transferAmount);
        totalAmount -= transferAmount;
        emit withdraw(msg.sender, transferAmount);
    }

    function withdraw2(uint256 withdrawAmount) public{
        require(balances[msg.sender] >= withdrawAmount, "Not enough funds");
        balances[msg.sender] -= withdrawAmount;
        totalAmount-=withdrawAmount;
        payable(msg.sender).transfer(withdrawAmount);
        
        emit withdraw(msg.sender, withdrawAmount);
    }
}