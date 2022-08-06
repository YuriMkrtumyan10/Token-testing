// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Token {
    //mint burn test

    string private name;
    string private symbol;
    uint256 private totalSupply;
    //solves division problem in solidity
    uint8 private decimals = 18;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

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
    event Approve(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    function transfer(uint256 _transferAmount, address _to) public {
        require(balances[msg.sender] >= _transferAmount, "Not enough funds");
        balances[msg.sender] -= _transferAmount;
        balances[_to] += _transferAmount;
        emit Transfer(msg.sender, _to, _transferAmount);
    }

    function transferFrom(
        uint256 _transferAmount,
        address _from,
        address _to
    ) public returns (bool success) {
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
        returns (bool success)
    {
        require(balances[msg.sender] >= _amount, "Not enough funds");
        allowances[msg.sender][_spender] += _amount;
        emit Approve(msg.sender, _spender, _amount);
        return true;
    }
}
