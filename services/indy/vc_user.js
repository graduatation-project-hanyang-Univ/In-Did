const indy = require('indy-sdk');

/** issuer로부터 받은 VC의 소유권을 증명하기 위한 master key(link secret) 생성 * */
async function proverCreateMasterSecret(options) {
  const { wh, masterSecretId } = options;

  return indy.proverCreateMasterSecret(wh, masterSecretId);
}

/** issuer의 credential definition을 요청하는 트랜잭션 생성
 *  전송은 ledger.js 에 submitRequest * */
async function buildGetCredDefRequest(options) {
  const { submitterDid, id } = options;

  return indy.buildGetCredDefRequest(submitterDid, id);
}

/** Credential offer에 대한 credential request 생성
 *  이후 이 요청을 issuer에게 보낸다. * */
async function proverCreateCredentialReq(options) {
  const { wh, proverDid, credOffer, credDef, masterSecretId } = options;

  return indy.proverCreateCredentialReq(wh, proverDid, credOffer, credDef, masterSecretId);
}

/** 지갑에 VC 저장 * */
async function proverStoreCredential(options) {
  const { wh, credId, credReqMetadata, cred, credDef, revRegDef } = options;

  return indy.proverStoreCredential(wh, credId, credReqMetadata, cred, credDef, revRegDef);
}

module.exports = {
  proverCreateMasterSecret,
  buildGetCredDefRequest,
  proverCreateCredentialReq,
  proverStoreCredential,
};
