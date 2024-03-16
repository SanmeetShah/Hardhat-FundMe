// last step of dev
// testing on a testnet

const {getNamedAccounts, ethers,network} = require("hardhat");
const {assert} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
? describe.skip 
: describe("FundMe", function () {
    let fundMe;
    let deployer;
    const sendValue = ethers.parseEther("1");
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const myFundMe = await deployments.get("FundMe");
        fundMe =  await ethers.getContractAt(
            myFundMe.abi,
            myFundMe.address,
        );
    });

    it("allows people to fund and withdraw", async function () {
        await fundMe.fund({value: sendValue});
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(),"0");
    });
});