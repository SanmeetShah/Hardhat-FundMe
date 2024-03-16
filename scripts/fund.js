const {getNamedAccounts, ethers} = require('hardhat');

async function main(){
    const {deployer} = await getNamedAccounts();
    const myFundMe = await deployments.get("FundMe");    //gets the deployed contract by name
    const fundMe =  await ethers.getContractAt(
        myFundMe.abi,
        myFundMe.address,
    );
    console.log("Funding contract");
    const tx = await fundMe.fund({value: ethers.parseEther("0.1")});
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
  });