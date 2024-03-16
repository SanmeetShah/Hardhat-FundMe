// mocks are only used for local testing and not for mainnet or testnet
// if any network does not have a price feed address, we will use the mock

const { network } = require("hardhat");
const { developmentChains, DECIMALS,INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) =>{
    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts();

    if(developmentChains.includes(network.name)){
        console.log("Local n/w,deploying mocks");
        await deploy("MockV3Aggregator",{
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,   // to see the logs of deployment
            args:[DECIMALS,INITIAL_ANSWER],
        });
        console.log("Mock deployed");
        console.log("-----------------");
    }
}

//to run specific deployment scripts
// command: yarn hardhat deploy --tags <tag-name>
module.exports.tags = ["all","mocks"];