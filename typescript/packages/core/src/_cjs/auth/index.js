Object.defineProperty(exports, '__esModule', { value: true });
exports.PrivateKeySigner =
  exports.createPrivateKeySigner =
  exports.createClefSigner =
  exports.ClefSigner =
    void 0;
var signer_1 = require('./clef/signer');
Object.defineProperty(exports, 'ClefSigner', { enumerable: true, get: () => signer_1.ClefSigner });
Object.defineProperty(exports, 'createClefSigner', {
  enumerable: true,
  get: () => signer_1.createClefSigner,
});
var signer_2 = require('./privatekey/signer');
Object.defineProperty(exports, 'createPrivateKeySigner', {
  enumerable: true,
  get: () => signer_2.createPrivateKeySigner,
});
Object.defineProperty(exports, 'PrivateKeySigner', {
  enumerable: true,
  get: () => signer_2.PrivateKeySigner,
});
//# sourceMappingURL=index.js.map
