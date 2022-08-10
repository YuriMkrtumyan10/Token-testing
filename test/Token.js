const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
    async function deployToken() {
        const [owner, recipient, otherAccount] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();

        return { token, owner, recipient, otherAccount };
    }

    describe("Initial State", () => {
        it("Should have 'name' and 'symbol' specified at the constructor and always have '18' for the decimals.", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const name = 'Nighty';
            const symbol = 'NY';

            expect(await token.getSymbol()).to.equal(symbol);
            expect(await token.getDecimals()).to.equal(18);
            expect(await token.getName()).to.equal(name);
        });

        it("Should have 10^10 supply, only for msg.sender.", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;

            expect(await token.getTotalSupply()).to.equal(totalSupply);
        });
    });

    describe("Minting", () => {             //or other accounts
        it("Can mint tokens increasing the owner;s balance and total supply as much", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;
            const mintAmount = 1000;
            await token.addAddressToWhitelist(owner.address);
            await token.mint(owner.address, mintAmount);
            expect(await token.balanceOf(owner.address)).to.equal(totalSupply + mintAmount);
            expect(await token.getTotalSupply()).to.equal(totalSupply + mintAmount);
        });
    });

    describe("Transfer", () => {
        it("Can transfer decreasing sender's balance and increasing recipient's balance as much.", async () => {
            const { token, owner, recipient } = await loadFixture(deployToken);
            const transferAmount = 1000;
            const totalSupply = 10000000000;
            await token.addAddressToWhitelist(owner.address);

            expect(await token.transfer(transferAmount, recipient.address)).to.changeTokenBalance(token, recipient, transferAmount);
            expect(await token.transfer(transferAmount, recipient.address)).to.changeTokenBalance(token, owner, -transferAmount);
            await expect(token.transfer(totalSupply+1,recipient.address))
            .to.be.revertedWith('Not enough funds');
        });


        it("Should not change balances of irrelative accounts", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const transferAmount = 1000;
            await token.addAddressToWhitelist(owner.address);
            await token.transfer(transferAmount, recipient.address);

            expect(await token.balanceOf(owner.address)).to.equal(await token.getTotalSupply() - await token.balanceOf(recipient.address));
        });

        it("Should not change total supply at all after transfers.", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const transferAmount = 1000;
            const transferAmount2 = 2000;
            const totalSupply = await token.getTotalSupply();
            await token.addAddressToWhitelist(owner.address);
            await token.transfer(transferAmount, recipient.address);
            await token.transfer(transferAmount2, otherAccount.address);

            expect(await token.getTotalSupply(), totalSupply);
        });


    });

    xdescribe("TransferFrom", () => {
        it("Should transfer money from specified account to another", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const transferAmount = 1000;
            await token.addAddressToWhitelist(owner.address);
            await token.addAddressToWhitelist(recipient.address);
            await token.approve(recipient.address,transferAmount);


            await expect(token.transferFrom(transferAmount-1,recipient.address,otherAccount.address))
            .to.be.revertedWith('Not allowed');
            //cant check 2 reverts in the same It ask!!!!
            // await expect(token.transferFrom(transferAmount+1,recipient.address,otherAccount.address))
            // .to.be.revertedWith('Not enough funds');

            expect(await token.approve(recipient.address, transferAmount), true);
            expect(await token.transferFrom(transferAmount, recipient.address, otherAccount.address), true);
            expect(await token.balanceOf(otherAccount.address), 1000);
        })
    })

    describe("Approval", () => {
        it("Should change approved account's balance, but not owner's", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const approvalAmount = 5000000000;
            const totalSupply = await token.getTotalSupply();

            await token.approve(recipient.address, approvalAmount);

            expect(await token.balanceOf(recipient.address), approvalAmount);
            expect(await token.balanceOf(owner.address), totalSupply);
            await expect(token.approve(recipient.address,totalSupply+1))
            .to.be.revertedWith('Not enough funds');

        });
    });

    describe("Burning", () => {
        it("Can burn tokens decreasing the target's balance and total supply as much", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;
            const burnAmount = 1000;
            await token.burn(owner.address, burnAmount);
            expect(await token.balanceOf(owner.address), totalSupply - burnAmount);
            expect(await token.getTotalSupply(), totalSupply - burnAmount);
            await expect(token.burn(owner.address,totalSupply+1))
            .to.be.revertedWith('Negative Funds!');
        });
    });

    describe("Events", () => {
        it("Testing what 'Transfer' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(owner.address);

            await expect(token.transfer(7, recipient.address))
                .to.emit(token, 'Transfer')
                .withArgs(owner.address, recipient.address, 7);

        });
        it("Testing what 'Approve' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(owner.address);

            await expect(token.approve(recipient.address, 7))
                .to.emit(token, 'Approve')
                .withArgs(owner.address, recipient.address, 7);

        });
        it("Testing what 'Purchase' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(owner.address);

            await expect(token.purchase({value: 20}))
                .to.emit(token, 'Purchase')
                .withArgs(owner.address, 10);

        });
        xit("Testing what 'Sell' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(owner.address);
            await expect(token.sell(20))
                .to.emit(token, 'Sell')
                .withArgs(owner.address, 20);

        });
    });

    describe("Buy and Sell", () => {
        it("Should buy tokens, only whiteListed accounts", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(recipient.address);
            await token.connect(recipient).purchase({ value: 1000 });
            
            expect(await token.balanceOf(recipient.address)).to.equal(500);
        });
        it("Should sell tokens, only whiteListed accounts", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            await token.addAddressToWhitelist(recipient.address);
            await token.connect(recipient).purchase({ value: 1000 });
            await token.connect(recipient).sell(500);
            
            expect(await token.balanceOf(recipient.address)).to.equal(0);
        });
    });

});