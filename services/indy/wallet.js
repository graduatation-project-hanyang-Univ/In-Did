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

/** 지갑 삭제 * */
async function deleteWallet(config, credentials) {
  const path = `${utils.getIndyStoragePath()}/wallets`;

  await indy.deleteWallet(
    {
      storage_config: { path },
      ...config,
    },
    credentials,
  );
}

/** 생성한 지갑에 접근 * */
async function openWallet(config, credentials) {
  const path = `${utils.getIndyStoragePath()}/wallets`;

  return indy.openWallet(
    {
      storage_config: { path },
      ...config,
    },
    credentials,
  );
}

async function closeWallet(walletHandle) {
  return indy.closeWallet(walletHandle);
}

module.exports = {
  createWallet,
  deleteWallet,
  openWallet,
  closeWallet,
};
