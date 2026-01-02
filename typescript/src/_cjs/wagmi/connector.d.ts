import { type LocalAccount } from 'viem/accounts';
import { type CreateConnectorFn } from 'wagmi';
export declare function privateKeyConnector(options?: PrivateKeyConnectorOptions): CreateConnectorFn;
export interface PrivateKeyConnectorOptions {
    account?: LocalAccount;
    generateOnConnect?: boolean;
}
//# sourceMappingURL=connector.d.ts.map