const indy = require('indy-sdk');
const utils = require('./utils');
require('dotenv').config();

/** 테스트를 위해 로컬에 인디 레저 풀 생성 * */
async function createGenesisLedger() {
  await indy.setProtocolVersion(2);
  const genesisFilePath = await utils.getPoolGenesisTxnPath();
  const poolConfig = { genesis_txn: genesisFilePath };
  await indy.createPoolLedgerConfig(process.env.POOL_NAME, poolConfig);
}

/** 생성한 풀에 접근 * */
async function getPoolHandle() {
  return indy.openPoolLedger(process.env.POOL_NAME);
}

async function closePoolLedger(poolHandle) {
  return indy.closePoolLedger(poolHandle);
}

async function deletePoolLedgerConfig() {
  await indy.deletePoolLedgerConfig(process.env.POOL_NAME);
}

async function listPools() {
  return indy.listPools();
}

module.exports = {
  createGenesisLedger,
  deletePoolLedgerConfig,
  getPoolHandle,
  closePoolLedger,
  listPools,
};
