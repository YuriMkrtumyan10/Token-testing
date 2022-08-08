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
            assert.equal(await token.getName(), name);
            assert.equal(await token.getSymbol(), symbol);
            assert.equal(await token.getDecimals(), 18);
            //expect(await token.balances[owner.address]).to.equal(10000000000);
        });

        it("Should have 10^10 supply, only for msg.sender.", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;

            assert.equal(await token.getTotalSupply(), totalSupply);
        });
    });

    describe("Minting", () => {             //or other accounts
        it("Can mint tokens increasing the owner;s balance and total supply as much", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;
            const mintAmount = 1000;
            await token.mint(owner.address, mintAmount);
            assert.equal(await token.balanceOf(owner.address), totalSupply + mintAmount);
            assert.equal(await token.getTotalSupply(), totalSupply + mintAmount);
        });
    });

    describe("Transfer", () => {
        it("Can transfer decreasing sender's balance and increasing recipient's balance as much.", async () => {
            const { token, owner, recipient } = await loadFixture(deployToken);
            const transferAmount = 1000;
            // await token.transfer(transferAmount, recipient.address);
            // assert.equal(await token.balanceOf(owner.address), await token.balanceOf(owner.address) - transferAmount);
            // assert.equal(await token.balanceOf(recipient.address),await token.balanceOf(recipient.address)+ transferAmount);

            expect(await token.transfer(transferAmount, recipient.address)).to.changeEtherBalance(recipient, transferAmount);
            expect(await token.transfer(transferAmount, recipient.address)).to.changeEtherBalance(owner, -transferAmount);
        });


        it("Should not change balances of irrelative accounts", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            // assert.equal(await token.balanceOf(otherAccount.address), 0);
            //or
            const transferAmount = 1000;
            await token.transfer(transferAmount, recipient.address);
            assert.equal(await token.balanceOf(owner.address), await token.getTotalSupply() - await token.balanceOf(recipient.address));
        });

        it("Should not change total supply at all after transfers.", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const transferAmount = 1000;
            const transferAmount2 = 2000;
            const totalSupply = await token.getTotalSupply();
            await token.transfer(transferAmount, recipient.address);
            await token.transfer(transferAmount2, otherAccount.address);

            expect(await token.getTotalSupply(), totalSupply);


        });


    });

    // describe("TransferFrom", () => {
    //     it("Should transfer money from specified account to another", async () => {
    //         const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
    //         const transferAmount = 1000;
    //         expect(await token.approve(recipient.address, transferAmount), true);
    //         expect(await token.transferFrom(transferAmount, recipient.address, otherAccount.address), true);
    //         expect(await token.balanceOf(otherAccount.address), 1000);
    //     })
    // })

    describe("Approval", () => {
        it("Should change approved account's balance, but not owner's", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);
            const approvalAmount = 5000000000;
            const totalSupply = await token.getTotalSupply();
            await token.approve(recipient.address, approvalAmount);

            expect(await token.balanceOf(recipient.address), approvalAmount);
            expect(await token.balanceOf(owner.address), totalSupply);

        });
    });

    describe("Burning", () => {
        it("Can burn tokens decreasing the target's balance and total supply as much", async () => {
            const { token, owner } = await loadFixture(deployToken);
            const totalSupply = 10000000000;
            const burnAmount = 1000;
            await token.burn(owner.address, burnAmount);
            assert.equal(await token.balanceOf(owner.address), totalSupply - burnAmount);
            assert.equal(await token.getTotalSupply(), totalSupply - burnAmount);
        });
    });

    describe("Events", () => {
        it("Testing what 'Transfer' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);

            await expect(token.transfer(7, recipient.address))
                .to.emit(token, 'Transfer')
                .withArgs(owner.address, recipient.address, 7);

        });
        it("Testing what 'Approve' event was emitted with what arguments", async () => {
            const { token, owner, recipient, otherAccount } = await loadFixture(deployToken);

            await expect(token.approve(recipient.address, 7))
                .to.emit(token, 'Approve')
                .withArgs(owner.address, recipient.address, 7);

        });
    });

});