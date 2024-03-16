const { networkConfig } = require("../helper-hardhat-config");
const {network} = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verifyContract } = require("../utils/verify");

/*
module.exports = async(hre) => {    // hre -> hardhat runtime environment object
    const {getNamedAccounts, deployments} = hre;    // same as hre.getNamedAccounts() and hre.deployments
}
*/
// same as
module.exports = async({getNamedAccounts, deployments}) => {
    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    // we get price feed address according to the network we are on
    let ethUsdPriceFeedAddress;
    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }
    else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    // when we want to use localhost or hardhat network we will use the mock
    // mocking is creating a fake version of blockchain environment for testing purposes
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe",{
        from : deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // console.log(fundMe);

    if(!developmentChains.includes(network.name)){
        await verifyContract(fundMe.address,args);
    }

    console.log("-----------------");
}

module.exports.tags = ["all","fund-me"];