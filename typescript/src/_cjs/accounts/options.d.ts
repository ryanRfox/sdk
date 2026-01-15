import type { Hex, LocalAccount } from 'viem';
export type AccountOption = (options: AccountOptions) => Promise<void>;
export interface AccountOptions {
    account?: LocalAccount;
}
export declare function withPrivateKey(key: Hex): AccountOption;
export declare function withAccount(account: LocalAccount): AccountOption;
//# sourceMappingURL=options.d.ts.map