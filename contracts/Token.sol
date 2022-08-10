// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is Ownable {
    //mint burn test

    string private name;
    string private symbol;
    uint256 private totalSupply;
    uint256 public tokenPrice = 2 wei;

    //solves division problem in solidity
    uint8 private decimals = 18;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => bool) private whiteList;

    modifier onlyWhitelisted() {
        require(whiteList[msg.sender]);
        _;
    }

    function addAddressToWhitelist(address addr)
        public
        onlyOwner
        returns (bool success)
    {
        if (!whiteList[addr]) {
            whiteList[addr] = true;
            success = true;
        }
    }

    function removeAddressFromWhitelist(address addr)
        public
        onlyOwner
        returns (bool success)
    {
        if (whiteList[addr]) {
            whiteList[addr] = false;
            success = true;
        }
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getSymbol() public view returns (string memory) {
        return symbol;
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function getDecimals() public view returns (uint8) {
        return decimals;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function allowance(address _owner, address _spender)
        public
        view
            returns (uint256 remaining)
    {
        return allowances[_owner][_spender];
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event Approve(address indexed _owner, address indexed _spender, uint256 _value);
    event Purchase(address indexed _who, uint256 _amount);
    event Sell(address indexed _who, uint256 _amount);

    constructor() {
        name = "Nighty";
        symbol = "NY";
        totalSupply = 10000000000;
        balances[msg.sender] = totalSupply;
    }

    function mint(address _target, uint256 _mintAmount) public onlyWhitelisted {
        balances[_target] += _mintAmount;
        totalSupply += _mintAmount;
    }

    function burn(address _target, uint256 _burnAmount) public      {
        require(balances[_target] >= _burnAmount, "Negative Funds!");
        balances[_target] -= _burnAmount;
        totalSupply -= _burnAmount;
    }

    function transfer(uint256 _transferAmount, address _to) public onlyWhitelisted {
        require(balances[msg.sender] >= _transferAmount, "Not enough funds");
        balances[msg.sender] -= _transferAmount;
        balances[_to] += _transferAmount;
        emit Transfer(msg.sender, _to, _transferAmount);
    }

    function transferFrom (
        uint256 _transferAmount,
        address _from,
        address _to
    ) public onlyWhitelisted returns (bool success) {
        require(allowances[_from][_to] >= _transferAmount, "Not allowed");
        require(balances[_from] >= _transferAmount, "Not enough funds");
        allowances[_from][_to] -= _transferAmount;
        balances[_from] -= _transferAmount;
        balances[_to] += _transferAmount;
        emit Transfer(_from, _to, _transferAmount);
        return true;
    }

    function approve(address _spender, uint256 _amount)
        public
        onlyOwner
        returns (bool success)
    {
        require(balances[msg.sender] >= _amount, "Not enough funds");
        allowances[msg.sender][_spender] += _amount;
        emit Approve(msg.sender, _spender, _amount);
        return true;
    }

    function purchase() public payable onlyWhitelisted{
        mint(msg.sender, msg.value / tokenPrice);
        emit Purchase(msg.sender, msg.value / tokenPrice);
    }

    function sell(uint256 _tokenToWeiAmount) public onlyWhitelisted {
        burn(msg.sender, _tokenToWeiAmount);
        payable(msg.sender).transfer(_tokenToWeiAmount * tokenPrice);
        emit Transfer(msg.sender, address(this), _tokenToWeiAmount);
        emit Sell(msg.sender, _tokenToWeiAmount);
    }
}
