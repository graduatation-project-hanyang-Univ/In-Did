const indy = require('indy-sdk');

async function createAndStoreMyDid(walletHandle, did) {
  return indy.createAndStoreMyDid(walletHandle, did);
}

module.exports = {
  createAndStoreMyDid,
};
