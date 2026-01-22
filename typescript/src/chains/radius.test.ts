import { describe, expect, it } from 'vitest';
import { radius } from './radius';
import { radiusTestnet } from './radiusTestnet';

describe('Radius Chain Configurations', () => {
	describe('radiusTestnet', () => {
		it('should have the correct chain id', () => {
			expect(radiusTestnet.id).toBe(1223953);
		});

		it('should have the correct name', () => {
			expect(radiusTestnet.name).toBe('Radius Testnet');
		});

		it('should have native currency set to USD', () => {
			expect(radiusTestnet.nativeCurrency).toEqual({
				decimals: 18,
				name: 'USD',
				symbol: 'USD',
			});
		});

		it('should have correct RPC URL', () => {
			expect(radiusTestnet.rpcUrls.default.http).toEqual(['https://rpc.testnet.radiustech.xyz']);
		});

		it('should have block explorer configured', () => {
			expect(radiusTestnet.blockExplorers?.default).toBeDefined();
			expect(radiusTestnet.blockExplorers?.default.name).toBe('Radius Explorer');
			expect(radiusTestnet.blockExplorers?.default.url).toBe(
				'https://explorer.testnet.radiustech.xyz',
			);
		});

		it('should be marked as a testnet', () => {
			expect(radiusTestnet.testnet).toBe(true);
		});

		it('should have multicall3 contract configured', () => {
			expect(radiusTestnet.contracts?.multicall3).toBeDefined();
			expect(radiusTestnet.contracts?.multicall3?.address).toBe(
				'0xcA11bde05977b3631167028862bE2a173976CA11',
			);
			expect(radiusTestnet.contracts?.multicall3?.blockCreated).toBe(1768594222351);
		});
	});

	describe('radius (mainnet)', () => {
		it('should have the correct chain id', () => {
			expect(radius.id).toBe(723);
		});

		it('should have the correct name', () => {
			expect(radius.name).toBe('Radius');
		});

		it('should have native currency set to USD', () => {
			expect(radius.nativeCurrency).toEqual({
				decimals: 18,
				name: 'USD',
				symbol: 'USD',
			});
		});

		it('should have correct RPC URL', () => {
			expect(radius.rpcUrls.default.http).toEqual(['https://rpc.radiustech.xyz']);
		});

		it('should have block explorer configured', () => {
			expect(radius.blockExplorers?.default).toBeDefined();
			expect(radius.blockExplorers?.default.name).toBe('Radius Explorer');
			expect(radius.blockExplorers?.default.url).toBe('https://explorer.radiustech.xyz');
		});

		it('should not be marked as a testnet', () => {
			expect(radius.testnet).toBe(false);
		});
	});

	describe('Chain Differences', () => {
		it('radiusTestnet and radius should have different chain ids', () => {
			expect(radiusTestnet.id).not.toBe(radius.id);
		});

		it('radiusTestnet and radius should have different names', () => {
			expect(radiusTestnet.name).not.toBe(radius.name);
		});

		it('radiusTestnet and radius should have different RPC URLs', () => {
			expect(radiusTestnet.rpcUrls.default.http[0]).not.toBe(radius.rpcUrls.default.http[0]);
		});

		it('radiusTestnet should be testnet but radius should not', () => {
			expect(radiusTestnet.testnet).toBe(true);
			expect(radius.testnet).toBe(false);
		});

		it('both chains should have the same native currency', () => {
			expect(radiusTestnet.nativeCurrency).toEqual(radius.nativeCurrency);
		});
	});
});
