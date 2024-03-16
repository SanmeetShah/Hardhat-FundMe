const { run } = require("hardhat");

async function verifyContract(contractAddress,args) {
    console.log("Verifying...");
    try{
      await run("verify:verify",{
        address: contractAddress,
        constructorArguments: args,
      });
    }catch(e){
      if(e.message.toLowerCase().includes("already verified")){
        console.log("Contract already verified");
      }
      else{
        console.log("Error in verification: ",e);
      }
    }
  }

module.exports = {verifyContract};