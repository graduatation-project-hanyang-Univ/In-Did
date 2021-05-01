const indy = require('indy-sdk');

/** VC 양식을 제출할 수 있는 credential offer 생성 * */
async function issuerCreateCredentialOffer(options) {
  const { wh, credDefId } = options;

  return indy.issuerCreateCredentialOffer(wh, credDefId);
}

/** 수신한 VC 요청 데이터로 VC를 생성. 이후 user에게 전달 * */
async function issuerCreateCredential(options) {
  const { wh, credOffer, credReq, credValues, revRegId, blobStorageReaderHandle } = options;

  return indy.issuerCreateCredential(wh, credOffer, credReq, credValues, revRegId, blobStorageReaderHandle);
}

module.exports = {
  issuerCreateCredentialOffer,
  issuerCreateCredential,
};
