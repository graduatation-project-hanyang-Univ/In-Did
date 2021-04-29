const indy = require('indy-sdk');

/** NYN 트랜잭션 생성 * */
async function buildNymRequest(options) {
  const { submitterDid, targetDid, verkey, alias, role } = options;

  return indy.buildNymRequest(submitterDid, targetDid, verkey, alias, role);
}

/** ATTRIB 트랜잭션 생성 * */
async function buildAttribRequest(options) {
  const { submitterDid, targetDid, hash, raw, enc } = options;

  return indy.buildAttribRequest(submitterDid, targetDid, hash, raw, enc);
}

/** SCHEMA 트랜잭션 생성  * */
async function buildSchemaRequest(options) {
  const { submitterDid, data } = options;
  return indy.buildSchemaRequest(submitterDid, data);
}

async function buildCredDefRequest(options) {
  const { submitterDid, data } = options;
  return indy.buildCredDefRequest(submitterDid, data);
}

/** 생성한 트랜잭션을 indy-node에 전송 * */
async function signAndSubmitRequest(options) {
  const { poolHandle, walletHandle, submitterDid, request } = options;

  return indy.signAndSubmitRequest(poolHandle, walletHandle, submitterDid, request);
}

module.exports = {
  buildNymRequest,
  buildAttribRequest,
  buildSchemaRequest,
  buildCredDefRequest,
  signAndSubmitRequest,
};
