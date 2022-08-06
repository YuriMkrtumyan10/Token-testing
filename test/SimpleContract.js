const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("SimpleContract", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimpleContract() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const SimpleContract = await ethers.getContractFactory("SimpleContract");
        // if has constructor write arguments
        const simpleContract = await SimpleContract.deploy();

        return { simpleContract, owner, otherAccount };
    }

    describe("Deposit", function () {
        it("Should deposit with correct args: ", async function () {
            const { simpleContract, owner } = await loadFixture(deploySimpleContract);

            await simpleContract.deposit({ value: 1000 });
            expect(await simpleContract.balances(owner.address)).to.equal(1000);
        })
    })

    describe("Withdraw", function () {
        it("Should withdraw all the money: ", async function () {
            const { simpleContract, owner } = await loadFixture(deploySimpleContract);
            await simpleContract.deposit({ value: 500 });
            await simpleContract.withdraw1();
            expect(await simpleContract.balances(owner.address)).to.equal(0);
        })
    })

    describe("Withdraw", function () {
        it("Should withdraw some of the money: ", async function () {
            const { simpleContract, owner } = await loadFixture(deploySimpleContract);
            await simpleContract.deposit({ value: 500 });
            await simpleContract.withdraw2(200);
            expect(await simpleContract.balances(owner.address)).to.equal(300);
        })
    })
});