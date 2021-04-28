const indy = require('indy-sdk');

/** DID를 생성만하고, 실제로 레저에 올리지는 않은 상태 **/
async function createAndStoreMyDid(walletHandle, did) {
  return indy.createAndStoreMyDid(walletHandle, did);
}

module.exports = {
  createAndStoreMyDid,
};
