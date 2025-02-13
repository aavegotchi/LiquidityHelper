/* global ethers */
/* eslint-disable  prefer-const */

import { SafeTransactionDataPartial } from "@gnosis.pm/safe-core-sdk-types";
import { Signer } from "@ethersproject/abstract-signer";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PopulatedTransaction } from "@ethersproject/contracts";

export async function sendToMultisig(
  multisigAddress: string,
  signer: Signer,
  transaction: any,
  hre: HardhatRuntimeEnvironment
) {
  const abi = [
    "function submitTransaction(address destination, uint value, bytes data) public returns (uint transactionId)",
  ];
  const multisigContract = await hre.ethers.getContractAt(
    abi,
    multisigAddress,
    signer
  );
  console.log("Sending transaction to multisig:", multisigAddress);
  let tx = await multisigContract.submitTransaction(
    transaction.to,
    0,
    transaction.data,
    { gasPrice: 50000000000 }
  );
  let receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Failed to send transaction to multisig: ${tx.hash}`);
  }
  console.log("Completed sending transaction to multisig:", tx.hash);
  return tx;
}

export async function sendToGnosisSafe(
  hre: HardhatRuntimeEnvironment,
  multisigAddress: string,
  transaction: PopulatedTransaction,
  signer: Signer
) {
  console.log(
    `Sending to Gnosis Safe at address: ${multisigAddress} on ${hre.network.name} network`
  );

  try {
    const transactions: SafeTransactionDataPartial[] = [
      {
        to: multisigAddress,
        value: transaction.value ? transaction.value.toString() : "0",
        data: transaction.data ? transaction.data : "0x",
      },
    ];

    console.log("transactions:", transactions);

    /*const ethAdapterOwner1 = new EthersAdapter({
      ethers: hre.ethers,
      signer: signer,
    });

    const chainId = await ethAdapterOwner1.getChainId();
    console.log("chain id:", chainId);

    const safeSdk: Safe = await Safe.create({
      ethAdapter: ethAdapterOwner1,
      safeAddress: multisigAddress,
      contractNetworks: {},
    });

    const safeTransaction = await safeSdk.createTransaction(...transactions);

    await safeSdk.signTransaction(safeTransaction);
    */

    console.log("Owner has signed!");
  } catch (error) {
    console.log("Error creating txn:", error);
  }
}

/// //////////////////////////
// The code below serves as an example of how to use the sendToMultisig function
// defined above.
/// //////////////////////////
// async function main () {
//   const testing = ['hardhat', 'localhost'].includes(hre.network.name)
//   let signer
//   let sender = process.env.LEDGER
//   if (testing) {
//     await hre.network.provider.request({
//       method: 'hardhat_impersonateAccount',
//       params: [sender]
//     })
//     signer = await ethers.provider.getSigner(sender)
//   } else if (hre.network.name === 'matic') {
//     signer = new LedgerSigner(ethers.provider)
//   } else {
//     throw Error('Incorrect network selected')
//   }

//   const multisigAddress = process.env.DIAMOND_UPGRADER

//   const quickAddress = '0x831753DD7087CaC61aB5644b308642cc1c33Dc13'
//   const erc20 = await ethers.getContractAt('IERC20', quickAddress)

//   let tx = await erc20.populateTransaction.transfer(sender, ethers.utils.parseEther('0.0001'))
//   await sendToMultisig(multisigAddress, signer, tx)
// }

// if (require.main === module) {
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error)
//       process.exit(1)
//     })
// }

exports.sendToMultisig = sendToMultisig;
