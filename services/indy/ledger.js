const indy = require('indy-sdk');

/** NYN 트랜잭션 생성 * */
async function buildNymRequest(options) {
  const { submitterDid, targetDid, verkey, alias, role } = options;

  return indy.buildNymRequest(submitterDid, targetDid, verkey, alias, role);
}

/** GET_NYM 요청 생성 * */
async function buildGetNymRequest(options) {
  const { submitterDid, targetDid } = options;

  return indy.buildGetNymRequest(submitterDid, targetDid);
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

/** SCHEMA 트랜잭션 조회 * */
async function buildGetSchemaRequest(options) {
  const { submitterDid, id } = options;
  return indy.buildGetSchemaRequest(submitterDid, id);
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

async function submitRequest(options) {
  const { poolHandle, request } = options;

  return indy.submitRequest(poolHandle, request);
}

/** Revocation registry 등록을 위한 트랜잭션 생성  * */
async function buildRevocRegDefRequest(options) {
  const { submitterDid, data } = options;

  return indy.buildRevocRegDefRequest(submitterDid, data);
}

/** VC 폐기를 위한 트랜잭션 생성 * */
async function buildRevocRegEntryRequest(options) {
  const { submitterDid, revocRegDefId, revDefType, value } = options;

  return indy.buildRevocRegEntryRequest(submitterDid, revocRegDefId, revDefType, value);
}

/** issuer의 credential definition을 요청하는 트랜잭션 생성
 *  전송은 submitRequest로 (vc-user)* */
async function buildGetCredDefRequest(options) {
  const { submitterDid, id } = options;

  return indy.buildGetCredDefRequest(submitterDid, id);
}

async function buildGetRevocRegDefRequest(options) {
  const { submitterDid, id } = options;

  return indy.buildGetRevocRegDefRequest(submitterDid, id);
}

async function buildGetRevocRegDeltaRequest(options) {
  const { submitterDid, revocRegDefId, from, to } = options;

  return indy.buildGetRevocRegDeltaRequest(submitterDid, revocRegDefId, from, to);
}

async function parseGetCredDefResponse(getCredDefResponse) {
  return indy.parseGetCredDefResponse(getCredDefResponse);
}

async function parseGetRevocRegDefResponse(getRevocRegDefResponse) {
  return indy.parseGetRevocRegDefResponse(getRevocRegDefResponse);
}

async function parseGetNymResponse(getNymResponse) {
  return indy.parseGetNymResponse(getNymResponse);
}

async function parseGetSchemaResponse(getSchemaResponse) {
  return indy.parseGetSchemaResponse(getSchemaResponse);
}

module.exports = {
  buildNymRequest,
  buildGetNymRequest,
  buildAttribRequest,
  buildSchemaRequest,
  buildGetSchemaRequest,
  buildCredDefRequest,
  signAndSubmitRequest,
  submitRequest,
  buildRevocRegDefRequest,
  buildRevocRegEntryRequest,
  buildGetCredDefRequest,
  buildGetRevocRegDefRequest,
  buildGetRevocRegDeltaRequest,
  parseGetCredDefResponse,
  parseGetRevocRegDefResponse,
  parseGetNymResponse,
  parseGetSchemaResponse,
};
