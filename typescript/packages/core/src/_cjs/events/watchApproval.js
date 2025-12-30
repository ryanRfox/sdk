Object.defineProperty(exports, '__esModule', { value: true });
exports.watchApproval = watchApproval;
exports.watchApprovalForAddress = watchApprovalForAddress;
const viem_1 = require('viem');
const erc20_1 = require('../contracts/erc20');
function watchApproval(client, params) {
  const args = {};
  if (params.owner) args.owner = params.owner;
  if (params.spender) args.spender = params.spender;
  return client.watchContractEvent({
    address: params.address,
    abi: erc20_1.ERC20_ABI,
    eventName: 'Approval',
    args: Object.keys(args).length > 0 ? args : undefined,
    onLogs: (logs) => {
      const events = logs
        .map((log) => {
          try {
            const decoded = (0, viem_1.decodeEventLog)({
              abi: erc20_1.ERC20_ABI,
              data: log.data,
              topics: log.topics,
            });
            return {
              owner: decoded.args.owner,
              spender: decoded.args.spender,
              value: decoded.args.value,
              log: log,
            };
          } catch (error) {
            if (params.onError) {
              params.onError(
                error instanceof Error ? error : new Error('Failed to decode Approval event')
              );
            }
            return null;
          }
        })
        .filter((event) => event !== null);
      if (events.length > 0) {
        params.onApproval(events);
      }
    },
    onError: params.onError,
    pollingInterval: params.pollingInterval,
  });
}
function watchApprovalForAddress(client, params) {
  if (params.ownerOnly && params.spenderOnly) {
    throw new Error('Cannot set both ownerOnly and spenderOnly to true');
  }
  let owner;
  let spender;
  if (params.ownerOnly) {
    owner = params.watchAddress;
  } else if (params.spenderOnly) {
    spender = params.watchAddress;
  } else {
    const unwatchOwner = watchApproval(client, {
      address: params.tokenAddress,
      owner: params.watchAddress,
      onApproval: params.onApproval,
      onError: params.onError,
      sync: params.sync,
      pollingInterval: params.pollingInterval,
    });
    const unwatchSpender = watchApproval(client, {
      address: params.tokenAddress,
      spender: params.watchAddress,
      onApproval: params.onApproval,
      onError: params.onError,
      sync: params.sync,
      pollingInterval: params.pollingInterval,
    });
    return () => {
      unwatchOwner();
      unwatchSpender();
    };
  }
  return watchApproval(client, {
    address: params.tokenAddress,
    owner,
    spender,
    onApproval: params.onApproval,
    onError: params.onError,
    sync: params.sync,
    pollingInterval: params.pollingInterval,
  });
}
//# sourceMappingURL=watchApproval.js.map
