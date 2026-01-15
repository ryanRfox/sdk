import { privateKeyToAccount } from 'viem/accounts';
export function createPrivateKeySigner(privateKey) {
    return privateKeyToAccount(privateKey);
}
//# sourceMappingURL=signer.js.map