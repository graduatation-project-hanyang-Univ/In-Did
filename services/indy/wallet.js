const indy = require('indy-sdk');
const utils = require('./utils');

/** DID 등을 보관할 지갑 생성 * */
async function createWallet(config, credentials) {
  const path = `${utils.getIndyStoragePath()}/wallets`;

  await indy.createWallet(
    {
      storage_config: { path },
      ...config,
    },
    credentials,
  );
}

/** 생성한 지갑에 접근 * */
async function openWallet(config, credentials) {
  return indy.openWallet(config, credentials);
}

module.exports = {
  createWallet,
  openWallet,
};
