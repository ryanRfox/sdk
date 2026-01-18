/**
 * Integration tests for ERC20 contract interactions on Radius testnet.
 *
 * These tests validate ERC20 token interactions using the standard viem pattern:
 * - client.getContract() with erc20Abi
 * - Standard viem read/write operations
 *
 * If no ERC20 token exists at the canonical address, a test token is deployed.
 *
 * @module test/integration/erc20.integration.test
 */

import { createRadiusClient, type RadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { defineChain, erc20Abi, formatUnits, type Hex, type LocalAccount, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Environment configuration for integration tests.
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';
const RADIUS_PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY as `0x${string}` | undefined;

/**
 * Test ERC20 token address on Radius testnet.
 * If no contract exists here, a test token will be deployed.
 */
const TESTNET_ERC20_ADDRESS = '0x4635f5a14a97e7F175e6Aa0B0729F8Ed16fB2D4e' as const;

/**
 * Minimal ERC20 contract bytecode for testing.
 * This is a simple ERC20 with constructor(name, symbol, decimals, initialSupply).
 * Compiled from a minimal Solidity ERC20 implementation using Foundry (solc 0.8.30).
 */
const TEST_ERC20_BYTECODE = '0x608060405234801561000f575f5ffd5b506040516113df3803806113df833981810160405281019061003191906102d7565b835f908161003f919061057a565b50826001908161004f919061057a565b508160025f6101000a81548160ff021916908360ff160217905550806003819055508060045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055503373ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516101109190610658565b60405180910390a350505050610671565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6101808261013a565b810181811067ffffffffffffffff8211171561019f5761019e61014a565b5b80604052505050565b5f6101b1610121565b90506101bd8282610177565b919050565b5f67ffffffffffffffff8211156101dc576101db61014a565b5b6101e58261013a565b9050602081019050919050565b8281835e5f83830152505050565b5f61021261020d846101c2565b6101a8565b90508281526020810184848401111561022e5761022d610136565b5b6102398482856101f2565b509392505050565b5f82601f83011261025557610254610132565b5b8151610265848260208601610200565b91505092915050565b5f60ff82169050919050565b6102838161026e565b811461028d575f5ffd5b50565b5f8151905061029e8161027a565b92915050565b5f819050919050565b6102b6816102a4565b81146102c0575f5ffd5b50565b5f815190506102d1816102ad565b92915050565b5f5f5f5f608085870312156102ef576102ee61012a565b5b5f85015167ffffffffffffffff81111561030c5761030b61012e565b5b61031887828801610241565b945050602085015167ffffffffffffffff8111156103395761033861012e565b5b61034587828801610241565b935050604061035687828801610290565b9250506060610367878288016102c3565b91505092959194509250565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806103c157607f821691505b6020821081036103d4576103d361037d565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026104367fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826103fb565b61044086836103fb565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61047b610476610471846102a4565b610458565b6102a4565b9050919050565b5f819050919050565b61049483610461565b6104a86104a082610482565b848454610407565b825550505050565b5f5f905090565b6104bf6104b0565b6104ca81848461048b565b505050565b5b818110156104ed576104e25f826104b7565b6001810190506104d0565b5050565b601f82111561053257610503816103da565b61050c846103ec565b8101602085101561051b578190505b61052f610527856103ec565b8301826104cf565b50505b505050565b5f82821c905092915050565b5f6105525f1984600802610537565b1980831691505092915050565b5f61056a8383610543565b9150826002028217905092915050565b61058382610373565b67ffffffffffffffff81111561059c5761059b61014a565b5b6105a682546103aa565b6105b18282856104f1565b5f60209050601f8311600181146105e2575f84156105d0578287015190505b6105da858261055f565b865550610641565b601f1984166105f0866103da565b5f5b82811015610617578489015182556001820191506020850194506020810190506105f2565b868310156106345784890151610630601f891682610543565b8355505b6001600288020188555050505b505050505050565b610652816102a4565b82525050565b5f60208201905061066b5f830184610649565b92915050565b610d618061067e5f395ff3fe608060405234801561000f575f5ffd5b5060043610610091575f3560e01c8063313ce56711610064578063313ce5671461013157806370a082311461014f57806395d89b411461017f578063a9059cbb1461019d578063dd62ed3e146101cd57610091565b806306fdde0314610095578063095ea7b3146100b357806318160ddd146100e357806323b872dd14610101575b5f5ffd5b61009d6101fd565b6040516100aa9190610934565b60405180910390f35b6100cd60048036038101906100c891906109e5565b610288565b6040516100da9190610a3d565b60405180910390f35b6100eb610375565b6040516100f89190610a65565b60405180910390f35b61011b60048036038101906101169190610a7e565b61037b565b6040516101289190610a3d565b60405180910390f35b61013961065b565b6040516101469190610ae9565b60405180910390f35b61016960048036038101906101649190610b02565b61066d565b6040516101769190610a65565b60405180910390f35b610187610682565b6040516101949190610934565b60405180910390f35b6101b760048036038101906101b291906109e5565b61070e565b6040516101c49190610a3d565b60405180910390f35b6101e760048036038101906101e29190610b2d565b6108a4565b6040516101f49190610a65565b60405180910390f35b5f805461020990610b98565b80601f016020809104026020016040519081016040528092919081815260200182805461023590610b98565b80156102805780601f1061025757610100808354040283529160200191610280565b820191905f5260205f20905b81548152906001019060200180831161026357829003601f168201915b505050505081565b5f8160055f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103639190610a65565b60405180910390a36001905092915050565b60035481565b5f8160045f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156103fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103f390610c12565b60405180910390fd5b8160055f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156104b7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104ae90610c7a565b60405180910390fd5b8160045f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105039190610cc5565b925050819055508160055f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105919190610cc5565b925050819055508160045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105e49190610cf8565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516106489190610a65565b60405180910390a3600190509392505050565b60025f9054906101000a900460ff1681565b6004602052805f5260405f205f915090505481565b6001805461068f90610b98565b80601f01602080910402602001604051908101604052809291908181526020018280546106bb90610b98565b80156107065780601f106106dd57610100808354040283529160200191610706565b820191905f5260205f20905b8154815290600101906020018083116106e957829003601f168201915b505050505081565b5f8160045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054101561078f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078690610c12565b60405180910390fd5b8160045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546107db9190610cc5565b925050819055508160045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825461082e9190610cf8565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516108929190610a65565b60405180910390a36001905092915050565b6005602052815f5260405f20602052805f5260405f205f91509150505481565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f610906826108c4565b61091081856108ce565b93506109208185602086016108de565b610929816108ec565b840191505092915050565b5f6020820190508181035f83015261094c81846108fc565b905092915050565b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61098182610958565b9050919050565b61099181610977565b811461099b575f5ffd5b50565b5f813590506109ac81610988565b92915050565b5f819050919050565b6109c4816109b2565b81146109ce575f5ffd5b50565b5f813590506109df816109bb565b92915050565b5f5f604083850312156109fb576109fa610954565b5b5f610a088582860161099e565b9250506020610a19858286016109d1565b9150509250929050565b5f8115159050919050565b610a3781610a23565b82525050565b5f602082019050610a505f830184610a2e565b92915050565b610a5f816109b2565b82525050565b5f602082019050610a785f830184610a56565b92915050565b5f5f5f60608486031215610a9557610a94610954565b5b5f610aa28682870161099e565b9350506020610ab38682870161099e565b9250506040610ac4868287016109d1565b9150509250925092565b5f60ff82169050919050565b610ae381610ace565b82525050565b5f602082019050610afc5f830184610ada565b92915050565b5f60208284031215610b1757610b16610954565b5b5f610b248482850161099e565b91505092915050565b5f5f60408385031215610b4357610b42610954565b5b5f610b508582860161099e565b9250506020610b618582860161099e565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680610baf57607f821691505b602082108103610bc257610bc1610b6b565b5b50919050565b7f496e73756666696369656e742062616c616e63650000000000000000000000005f82015250565b5f610bfc6014836108ce565b9150610c0782610bc8565b602082019050919050565b5f6020820190508181035f830152610c2981610bf0565b9050919050565b7f496e73756666696369656e7420616c6c6f77616e6365000000000000000000005f82015250565b5f610c646016836108ce565b9150610c6f82610c30565b602082019050919050565b5f6020820190508181035f830152610c9181610c58565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610ccf826109b2565b9150610cda836109b2565b9250828203905081811115610cf257610cf1610c98565b5b92915050565b5f610d02826109b2565b9150610d0d836109b2565b9250828201905080821115610d2557610d24610c98565b5b9291505056fea264697066735822122073a7cd2056124de8e1752f6159fb43d5d3a18cd11238687f63372ba7c377c36c64736f6c634300081e0033' as Hex;

/**
 * ABI for the test ERC20 constructor.
 */
const TEST_ERC20_CONSTRUCTOR_ABI = [
	{
		type: 'constructor',
		inputs: [
			{ name: 'name', type: 'string' },
			{ name: 'symbol', type: 'string' },
			{ name: 'decimals', type: 'uint8' },
			{ name: 'initialSupply', type: 'uint256' },
		],
		stateMutability: 'nonpayable',
	},
] as const;

/**
 * Check if we have the required environment for write tests.
 */
const hasPrivateKey = !!RADIUS_PRIVATE_KEY;

/**
 * Create a chain configuration using the environment's RPC endpoint.
 */
function createTestChain() {
	return defineChain({
		...radiusTestnet,
		rpcUrls: {
			default: {
				http: [RADIUS_ENDPOINT],
			},
		},
	});
}

describe('ERC20 Integration Tests (Standard viem Pattern)', () => {
	let client: RadiusClient;
	let signer: LocalAccount | undefined;
	let tokenAddress: `0x${string}` | undefined;
	const testChain = createTestChain();

	beforeAll(async () => {
		// Create the client
		client = createRadiusClient({
			chain: testChain,
		});

		// Create signer if private key is available
		if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
			signer = privateKeyToAccount(RADIUS_PRIVATE_KEY);
		}

		// Check if the token contract exists at canonical address
		const code = await client.getCode({ address: TESTNET_ERC20_ADDRESS });
		if (code && code !== '0x' && code.length > 2) {
			tokenAddress = TESTNET_ERC20_ADDRESS;
			console.log(`Found existing ERC20 token at ${tokenAddress}`);
		} else if (signer) {
			// Deploy a test token since none exists
			console.log('No ERC20 token found, deploying test token...');
			try {
				const initialSupply = 1_000_000n * 10n ** 18n; // 1M tokens with 18 decimals
				const { address, receipt } = await client.deployContract(
					signer,
					TEST_ERC20_BYTECODE,
					[...TEST_ERC20_CONSTRUCTOR_ABI, ...erc20Abi],
					'Test Token',
					'TEST',
					18,
					initialSupply,
				);
				tokenAddress = address;
				console.log(`Deployed test ERC20 at ${tokenAddress} (block ${receipt.blockNumber})`);
			} catch (err) {
				console.error('Failed to deploy test token:', err);
			}
		} else {
			console.log('Warning: No ERC20 token found and no private key to deploy one');
		}
	}, 60000); // 60s timeout for potential deployment

	describe('ERC20 Read Operations (using client.getContract)', () => {
		it.skipIf(!hasPrivateKey)('should read token name using getContract', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const name = await token.read.name();

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);

			console.log(`Token name: ${name}`);
		});

		it.skipIf(!hasPrivateKey)('should read token symbol', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const symbol = await token.read.symbol();

			expect(symbol).toBeDefined();
			expect(typeof symbol).toBe('string');

			console.log(`Token symbol: ${symbol}`);
		});

		it.skipIf(!hasPrivateKey)('should read token decimals', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();

			expect(decimals).toBeDefined();
			expect(typeof decimals).toBe('number');
			expect(decimals).toBeGreaterThanOrEqual(0);
			expect(decimals).toBeLessThanOrEqual(18);

			console.log(`Token decimals: ${decimals}`);
		});

		it.skipIf(!hasPrivateKey)('should read total supply', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const totalSupply = await token.read.totalSupply();

			expect(totalSupply).toBeDefined();
			expect(typeof totalSupply).toBe('bigint');
			expect(totalSupply).toBeGreaterThanOrEqual(0n);

			console.log(`Total supply: ${totalSupply.toString()}`);
		});

		it.skipIf(!hasPrivateKey)('should read balance of address', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const balance = await token.read.balanceOf([zeroAddress]);

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			expect(balance).toBeGreaterThanOrEqual(0n);

			console.log(`Zero address balance: ${balance.toString()}`);
		});

		it.skipIf(!hasPrivateKey)('should read balance of signer', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');
			if (!signer) throw new Error('Signer not initialized');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const balance = await token.read.balanceOf([signer.address]);
			const decimals = await token.read.decimals();
			const symbol = await token.read.symbol();

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');

			const formatted = formatUnits(balance, decimals);
			console.log(`Signer token balance: ${formatted} ${symbol}`);
		});

		it.skipIf(!hasPrivateKey)('should read allowance', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const allowance = await token.read.allowance([zeroAddress, zeroAddress]);

			expect(allowance).toBeDefined();
			expect(typeof allowance).toBe('bigint');
			expect(allowance).toBeGreaterThanOrEqual(0n);
		});
	});

	describe('ERC20 Read Operations (using client.readContract)', () => {
		it.skipIf(!hasPrivateKey)('should read token name using readContract', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const name = await client.readContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: 'name',
			});

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
		});

		it.skipIf(!hasPrivateKey)('should read balance using readContract', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;

			const balance = await client.readContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: 'balanceOf',
				args: [zeroAddress],
			});

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
		});
	});

	describe('ERC20 Write Operations', () => {
		it.skipIf(!hasPrivateKey)(
			'should perform self-transfer using getContract.write',
			async () => {
				if (!tokenAddress) throw new Error('Token not deployed');
				if (!signer) throw new Error('Signer not initialized');

				const token = client.getContract({
					address: tokenAddress,
					abi: erc20Abi,
				});

				// Check balance first
				const balance = await token.read.balanceOf([signer.address]);

				if (balance < 1n) {
					console.log('Skipping transfer test: no token balance');
					return;
				}

				// Transfer 1 unit to self using the typed contract
				const receipt = await token.write.transfer({
					args: [signer.address, 1n],
					signer,
				});

				expect(receipt).toBeDefined();
				expect(receipt.status).toBe('success');

				console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
			},
			60000,
		);

		it.skipIf(!hasPrivateKey)(
			'should perform self-transfer using writeContract',
			async () => {
				if (!tokenAddress) throw new Error('Token not deployed');
				if (!signer) throw new Error('Signer not initialized');

				const token = client.getContract({
					address: tokenAddress,
					abi: erc20Abi,
				});

				// Check balance first
				const balance = await token.read.balanceOf([signer.address]);

				if (balance < 1n) {
					console.log('Skipping transfer test: no token balance');
					return;
				}

				// Transfer using writeContract directly
				const hash = await client.writeContract({
					address: tokenAddress,
					abi: erc20Abi,
					functionName: 'transfer',
					args: [signer.address, 1n],
					account: signer,
				});

				expect(hash).toBeDefined();
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				// Wait for confirmation
				const receipt = await client.waitForTransactionReceipt({ hash });
				expect(receipt.status).toBe('success');

				console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
			},
			60000,
		);
	});

	describe('Utility Functions (using viem directly)', () => {
		it.skipIf(!hasPrivateKey)('should format token amounts correctly', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();
			const oneToken = 10n ** BigInt(decimals);

			// Use viem's formatUnits directly
			const formatted = formatUnits(oneToken, decimals);

			expect(formatted).toBe('1');
		});

		it.skipIf(!hasPrivateKey)('should parse token amounts correctly', async () => {
			if (!tokenAddress) throw new Error('Token not deployed');

			const token = client.getContract({
				address: tokenAddress,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();

			// Use viem's parseUnits directly
			const parsed = parseUnits('1', decimals);
			const expected = 10n ** BigInt(decimals);

			expect(parsed).toBe(expected);
		});
	});
});
