const indy = require('indy-sdk');

/** VC 폐기 방법등이 정의되어있는 revoc_reg_def 생성 * */
async function issuerCreateAndStoreRevocReg(options) {
  const { wh, issuerDid, revocDefType, tag, credDefId, config, tailsWriterHandle } = options;

  return indy.issuerCreateAndStoreRevocReg(wh, issuerDid, revocDefType, tag, credDefId, config, tailsWriterHandle);
}

/** Revocation registry 등록을 위한 트랜잭션 생성  * */
async function buildRevocRegDefRequest(options) {
  const { submitterDid, data } = options;

  return indy.buildRevocRegDefRequest(submitterDid, data);
}

/** VC 폐기를 위한 정보 (issuer가 폐기) * */
async function issuerRevokeCredential(options) {
  const { wh, blobStorageReaderHandle, revRegId, credRevocId } = options;

  return indy.issuerRevokeCredential(wh, blobStorageReaderHandle, revRegId, credRevocId);
}

/** VC 폐기를 위한 트랜잭션 생성 * */
async function buildRevocRegEntryRequest(options) {
  const { submitterDid, revocRegDefId, revDefType, value } = options;

  return indy.buildRevocRegEntryRequest(submitterDid, revocRegDefId, revDefType, value);
}

module.exports = {
  issuerCreateAndStoreRevocReg,
  buildRevocRegDefRequest,
  issuerRevokeCredential,
  buildRevocRegEntryRequest,
};
