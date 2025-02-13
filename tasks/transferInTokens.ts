import { task } from "hardhat/config";

import { LedgerSigner } from "@anders-t/ethers-ledger";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PopulatedTransaction, Signer } from "ethers";
import {
  abi,
  HelperAddress,
  multisigAddress,
  transferTokenInTaskArgs,
} from "../scripts/libs/liqParamHelpers";
import { sendToMultisig } from "../scripts/libs/multisig";
import { impersonate } from "../helperFunctions";

task(
  "transferInTokens",
  "Sends tokens from the multisig to the Helper Contract"
)
  .addParam("multisig")
  .addParam("tokenAddress")
  .addParam("amount")
  .setAction(
    async (
      taskArgs: transferTokenInTaskArgs,
      hre: HardhatRuntimeEnvironment
    ) => {
      const multisig = taskArgs.multisig;
      const tokenAddress = taskArgs.tokenAddress;
      const amount = taskArgs.amount;

      let signer: Signer;
      if (hre.network.name == "matic") {
        signer = new LedgerSigner(hre.ethers.provider);
      } else {
        signer = (await hre.ethers.getSigners())[0];
      }
      console.log(
        `Transferring ${hre.ethers.utils.formatEther(
          amount
        )} ${tokenAddress} to helper contract`,
        HelperAddress
      );
      let erc20 = await hre.ethers.getContractAt(abi, tokenAddress);

      if (hre.network.name === "matic") {
        let tx: PopulatedTransaction = await erc20.populateTransaction.transfer(
          HelperAddress,
          amount,
          { gasLimit: 800000 }
        );
        await sendToMultisig(multisig, signer, tx, hre);
      } else {
        erc20 = await impersonate(
          multisigAddress,
          erc20,
          hre.ethers,
          hre.network
        );
        const tx = await erc20.transfer(HelperAddress, amount, {
          gasLimit: 800000,
        });
        await tx.wait();
      }
    }
  );
