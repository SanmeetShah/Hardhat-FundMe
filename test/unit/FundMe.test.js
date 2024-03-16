const { deployments,ethers,getNamedAccounts } = require("hardhat");
const { assert,expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    let deployer;
    const sendValue = ethers.parseEther("1");  // 1 eth
    beforeEach(async function () {
        // const accounts = await ethers.getSigners();    //gives accounts in network.config.accounts
        await deployments.fixture(["all"]);    //deploys all contracts with the "all" tag
        deployer = (await getNamedAccounts()).deployer;    //gets the named accounts from network.config
        const myFundMe = await deployments.get("FundMe");    //gets the deployed contract by name
        fundMe =  await ethers.getContractAt(
            myFundMe.abi,
            myFundMe.address,
        );
        const myMockV3Aggregator = await deployments.get("MockV3Aggregator");
        mockV3Aggregator = await ethers.getContractAt(
            myMockV3Aggregator.abi,
            myMockV3Aggregator.address,
        );
    });

    describe("constructor", async function () {
        it("Sets the aggregator correctly", async function () {
            const response = await fundMe.getPriceFeed();
            assert.equal(response,mockV3Aggregator.target);
        });
    });
    
    describe("fund",async function () {
        it("Fails if you dont send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        });
        it("Updates the amount funded data structure", async function () {
            await fundMe.fund({value: sendValue});
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(),sendValue.toString());
        });
        it("Adds funders to the funders array", async function () {
            await fundMe.fund({value: sendValue});
            const response = await fundMe.getFunders(0);
            assert.equal(response,deployer);
        });
    });

    describe("withdraw",async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue});
        });
        it("Withdraw ETH from a single funder", async function () {
            //Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const startingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,gasPrice} = transactionReceipt;
            const gasCost = gasUsed*gasPrice;

            const EndingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const EndingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Assert
            assert.equal(EndingFundMeBalance.toString(),0);
            // we use .add() function due to big number cannot be read by javascript
            assert.equal((EndingBalanceDeployer+gasCost).toString(),(startingBalanceDeployer+startingFundMeBalance).toString());
        });
        it("allows us to withdraw from multiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners();
            // console.log(accounts);
            for(let i=0;i<6;i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value: sendValue});
            }
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const startingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,gasPrice} = transactionReceipt;
            const gasCost = gasPrice*gasUsed;

            const EndingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const EndingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Assert
            assert.equal(EndingFundMeBalance.toString(),0);
            assert.equal((EndingBalanceDeployer+gasCost).toString(),(startingBalanceDeployer+startingFundMeBalance).toString());

            // make sure the funder is removed from the funders array
            await expect(fundMe.getFunders(0)).to.be.reverted;

            for(i=0;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0);
            }
        });
        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe,"FundMe__NotOwner");
        });
    });
    describe("cheaperWithdraw testing",async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue});
        });
        it("Withdraw ETH from a single funder", async function () {
            //Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const startingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,gasPrice} = transactionReceipt;
            const gasCost = gasUsed*gasPrice;

            const EndingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const EndingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Assert
            assert.equal(EndingFundMeBalance.toString(),0);
            // we use .add() function due to big number cannot be read by javascript
            assert.equal((EndingBalanceDeployer+gasCost).toString(),(startingBalanceDeployer+startingFundMeBalance).toString());
        });
        it("allows us to withdraw from multiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners();
            // console.log(accounts);
            for(let i=0;i<6;i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value: sendValue});
            }
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const startingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed,gasPrice} = transactionReceipt;
            const gasCost = gasPrice*gasUsed;

            const EndingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress());
            const EndingBalanceDeployer = await ethers.provider.getBalance(deployer);

            //Assert
            assert.equal(EndingFundMeBalance.toString(),0);
            assert.equal((EndingBalanceDeployer+gasCost).toString(),(startingBalanceDeployer+startingFundMeBalance).toString());

            // make sure the funder is removed from the funders array
            await expect(fundMe.getFunders(0)).to.be.reverted;

            for(i=0;i<6;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0);
            }
        });
        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWithCustomError(fundMe,"FundMe__NotOwner");
        });
    });
});