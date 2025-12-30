Object.defineProperty(exports, '__esModule', { value: true });
exports.MAX_GAS = void 0;
exports.createRadiusClient = createRadiusClient;
const viem_1 = require('viem');
const transport_1 = require('../transport');
exports.MAX_GAS = 1319413953330n;
function createRadiusClient(config) {
  let transport;
  if (config.transport) {
    transport = config.transport;
  } else if (config.logger || config.interceptor) {
    const rpcUrl = config.chain.rpcUrls.default.http[0];
    if (!rpcUrl) {
      throw new Error('No RPC URL configured for chain');
    }
    transport = (0, transport_1.createInterceptingTransport)({
      url: rpcUrl,
      interceptor: config.interceptor,
      logger: config.logger,
    });
  } else {
    const rpcUrl = config.chain.rpcUrls.default.http[0];
    if (!rpcUrl) {
      throw new Error('No RPC URL configured for chain');
    }
    transport = (0, transport_1.createInterceptingTransport)({ url: rpcUrl });
  }
  const publicClient = (0, viem_1.createPublicClient)({
    chain: config.chain,
    transport,
  });
  function toRadiusReceipt(receipt) {
    return {
      transactionHash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to ?? null,
      contractAddress: receipt.contractAddress ?? null,
      gasUsed: receipt.gasUsed,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      logs: receipt.logs,
    };
  }
  async function signAndSendTransaction(signer, tx) {
    const nonce = await publicClient.getTransactionCount({
      address: signer.address,
      blockTag: 'pending',
    });
    let gas;
    if (tx.gas !== undefined) {
      gas = tx.gas;
    } else {
      const estimate = await publicClient.estimateGas({
        account: signer.address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      const margin = estimate / 5n;
      gas = estimate + margin;
      if (gas > exports.MAX_GAS) {
        gas = exports.MAX_GAS;
      }
    }
    const signedTx = await signer.signTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value ?? 0n,
      nonce,
      gas,
      gasPrice: 0n,
      chainId: signer.chainId,
    });
    return publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    });
  }
  return {
    publicClient,
    async getChainId() {
      return BigInt(publicClient.chain?.id ?? (await publicClient.getChainId()));
    },
    async getBalance(address) {
      return publicClient.getBalance({ address });
    },
    async getCode(address) {
      const code = await publicClient.getCode({ address });
      return code ?? '0x';
    },
    async getNonce(address) {
      return publicClient.getTransactionCount({
        address,
        blockTag: 'pending',
      });
    },
    async estimateGas(tx) {
      const estimate = await publicClient.estimateGas(tx);
      const margin = estimate / 5n;
      const gas = estimate + margin;
      return gas > exports.MAX_GAS ? exports.MAX_GAS : gas;
    },
    async call(contract, method, ...args) {
      if (!contract.abi) {
        throw new Error('Contract ABI is required');
      }
      if (!contract.address) {
        throw new Error('Contract address is required');
      }
      const data = (0, viem_1.encodeFunctionData)({
        abi: contract.abi,
        functionName: method,
        args: args,
      });
      const result = await publicClient.call({
        to: contract.address,
        data,
      });
      if (!result.data) {
        throw new Error('No data returned from contract call');
      }
      const decoded = (0, viem_1.decodeFunctionResult)({
        abi: contract.abi,
        functionName: method,
        data: result.data,
      });
      return decoded;
    },
    async execute(contract, signer, method, ...args) {
      if (!contract.abi) {
        throw new Error('Contract ABI is required');
      }
      if (!contract.address) {
        throw new Error('Contract address is required');
      }
      const data = (0, viem_1.encodeFunctionData)({
        abi: contract.abi,
        functionName: method,
        args: args,
      });
      return signAndSendTransaction(signer, {
        to: contract.address,
        data,
        value: 0n,
      });
    },
    async executeSync(contract, signer, method, ...args) {
      const hash = await this.execute(contract, signer, method, ...args);
      return this.waitForReceipt(hash);
    },
    async send(signer, to, value) {
      return signAndSendTransaction(signer, {
        to,
        value,
      });
    },
    async sendSync(signer, to, value) {
      const hash = await this.send(signer, to, value);
      return this.waitForReceipt(hash);
    },
    async deployContract(signer, bytecode, abi, ...args) {
      let deployData = bytecode;
      if (args.length > 0) {
        const ctorItem = abi.find(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            'type' in item &&
            item.type === 'constructor'
        );
        if (ctorItem?.inputs && ctorItem.inputs.length > 0) {
          const encodedArgs = (0, viem_1.encodeAbiParameters)(ctorItem.inputs, args);
          deployData = `${bytecode}${encodedArgs.slice(2)}`;
        }
      }
      const hash = await signAndSendTransaction(signer, {
        data: deployData,
        value: 0n,
      });
      const receipt = await this.waitForReceipt(hash);
      if (!receipt.contractAddress) {
        throw new Error('Contract deployment failed: no contract address in receipt');
      }
      if (receipt.status !== 'success') {
        throw new Error('Contract deployment failed: transaction reverted');
      }
      return {
        address: receipt.contractAddress,
        receipt,
      };
    },
    async sendRawTransaction(signedTx) {
      return publicClient.sendRawTransaction({
        serializedTransaction: signedTx,
      });
    },
    async waitForReceipt(hash) {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return toRadiusReceipt(receipt);
    },
  };
}
//# sourceMappingURL=client.js.map
