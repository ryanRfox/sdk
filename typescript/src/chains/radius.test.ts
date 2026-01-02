import { describe, expect, it } from 'vitest';
import { radiusMainnet, radiusTestnet } from './radius';

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

		it('should have correct native currency decimals', () => {
			expect(radiusTestnet.nativeCurrency.decimals).toBe(18);
		});

		it('should have correct native currency name', () => {
			expect(radiusTestnet.nativeCurrency.name).toBe('USD');
		});

		it('should have correct native currency symbol', () => {
			expect(radiusTestnet.nativeCurrency.symbol).toBe('USD');
		});

		it('should have correct RPC URL', () => {
			expect(radiusTestnet.rpcUrls.default.http).toEqual(['https://rpc.testnet.radiustech.xyz']);
		});

		it('should have at least one HTTP RPC URL', () => {
			expect(radiusTestnet.rpcUrls.default.http.length).toBeGreaterThan(0);
		});

		it('should have a valid RPC URL format', () => {
			const rpcUrl = radiusTestnet.rpcUrls.default.http[0];
			expect(rpcUrl).toMatch(/^https?:\/\/.+/);
		});

		it('should have block explorer configured', () => {
			expect(radiusTestnet.blockExplorers.default).toBeDefined();
			expect(radiusTestnet.blockExplorers.default.name).toBe('Radius Explorer');
			expect(radiusTestnet.blockExplorers.default.url).toBe(
				'https://explorer.testnet.radiustech.xyz',
			);
		});

		it('should be marked as a testnet', () => {
			expect(radiusTestnet.testnet).toBe(true);
		});

		it('should have all required chain properties', () => {
			expect(radiusTestnet).toHaveProperty('id');
			expect(radiusTestnet).toHaveProperty('name');
			expect(radiusTestnet).toHaveProperty('nativeCurrency');
			expect(radiusTestnet).toHaveProperty('rpcUrls');
			expect(radiusTestnet).toHaveProperty('blockExplorers');
			expect(radiusTestnet).toHaveProperty('testnet');
		});
	});

	describe('radiusMainnet', () => {
		it('should have the correct chain id', () => {
			expect(radiusMainnet.id).toBe(1223954);
		});

		it('should have the correct name', () => {
			expect(radiusMainnet.name).toBe('Radius');
		});

		it('should have native currency set to USD', () => {
			expect(radiusMainnet.nativeCurrency).toEqual({
				decimals: 18,
				name: 'USD',
				symbol: 'USD',
			});
		});

		it('should have correct native currency decimals', () => {
			expect(radiusMainnet.nativeCurrency.decimals).toBe(18);
		});

		it('should have correct native currency name', () => {
			expect(radiusMainnet.nativeCurrency.name).toBe('USD');
		});

		it('should have correct native currency symbol', () => {
			expect(radiusMainnet.nativeCurrency.symbol).toBe('USD');
		});

		it('should have correct RPC URL', () => {
			expect(radiusMainnet.rpcUrls.default.http).toEqual(['https://rpc.radiustech.xyz']);
		});

		it('should have at least one HTTP RPC URL', () => {
			expect(radiusMainnet.rpcUrls.default.http.length).toBeGreaterThan(0);
		});

		it('should have a valid RPC URL format', () => {
			const rpcUrl = radiusMainnet.rpcUrls.default.http[0];
			expect(rpcUrl).toMatch(/^https?:\/\/.+/);
		});

		it('should have block explorer configured', () => {
			expect(radiusMainnet.blockExplorers.default).toBeDefined();
			expect(radiusMainnet.blockExplorers.default.name).toBe('Radius Explorer');
			expect(radiusMainnet.blockExplorers.default.url).toBe('https://explorer.radiustech.xyz');
		});

		it('should not be marked as a testnet', () => {
			expect(radiusMainnet.testnet).toBe(false);
		});

		it('should have all required chain properties', () => {
			expect(radiusMainnet).toHaveProperty('id');
			expect(radiusMainnet).toHaveProperty('name');
			expect(radiusMainnet).toHaveProperty('nativeCurrency');
			expect(radiusMainnet).toHaveProperty('rpcUrls');
			expect(radiusMainnet).toHaveProperty('blockExplorers');
			expect(radiusMainnet).toHaveProperty('testnet');
		});
	});

	describe('Chain Differences', () => {
		it('radiusTestnet and radiusMainnet should have different chain ids', () => {
			expect(radiusTestnet.id).not.toBe(radiusMainnet.id);
		});

		it('radiusTestnet and radiusMainnet should have different names', () => {
			expect(radiusTestnet.name).not.toBe(radiusMainnet.name);
		});

		it('radiusTestnet and radiusMainnet should have different RPC URLs', () => {
			expect(radiusTestnet.rpcUrls.default.http[0]).not.toBe(radiusMainnet.rpcUrls.default.http[0]);
		});

		it('radiusTestnet should be testnet but radiusMainnet should not', () => {
			expect(radiusTestnet.testnet).toBe(true);
			expect(radiusMainnet.testnet).toBe(false);
		});

		it('both chains should have the same native currency', () => {
			expect(radiusTestnet.nativeCurrency).toEqual(radiusMainnet.nativeCurrency);
		});

		it('both chains should have the same block explorer name', () => {
			expect(radiusTestnet.blockExplorers.default.name).toBe(
				radiusMainnet.blockExplorers.default.name,
			);
		});
	});
});
