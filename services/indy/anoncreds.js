/** anocres: Anonymous credentials * */
const indy = require('indy-sdk');

/** Schema 생성 * */
async function issuerCreateSchema(options) {
  const { issuerDid, name, version, attrNames } = options;

  return indy.issuerCreateSchema(issuerDid, name, version, attrNames);
}

async function issuerCreateAndStoreCredentialDef(options) {
  const { walletHandle, issuerDid, schema, tag, signatureType, config } = options;

  return indy.issuerCreateAndStoreCredentialDef(walletHandle, issuerDid, schema, tag, signatureType, config);
}

/** VC 폐기 방법등이 정의되어있는 revoc_reg_def 생성 * */
async function issuerCreateAndStoreRevocReg(options) {
  const { walletHandle, issuerDid, revocDefType, tag, credDefId, config, tailsWriterHandle } = options;

  return indy.issuerCreateAndStoreRevocReg(walletHandle, issuerDid, revocDefType, tag, credDefId, config, tailsWriterHandle);
}

/** VC 폐기 (issuer가 폐기) * */
async function issuerRevokeCredential(options) {
  const { walletHandle, blobStorageReaderHandle, revRegId, credRevocId } = options;

  return indy.issuerRevokeCredential(walletHandle, blobStorageReaderHandle, revRegId, credRevocId);
}

/**  VC 양식을 제출할 수 있는 credential offer 생성 * */
async function issuerCreateCredentialOffer(options) {
  const { walletHandle, credDefId } = options;

  return indy.issuerCreateCredentialOffer(walletHandle, credDefId);
}

/** 수신한 VC 요청 데이터로 VC를 생성. 이후 user에게 전달 * */
async function issuerCreateCredential(options) {
  const { walletHandle, credOffer, credReq, credValues, revRegId, blobStorageReaderHandle } = options;

  return indy.issuerCreateCredential(walletHandle, credOffer, credReq, credValues, revRegId, blobStorageReaderHandle);
}

/**  issuer로부터 받은 VC의 소유권을 증명하기 위한 master key(link secret) 생성 * */
async function proverCreateMasterSecret(options) {
  const { walletHandle, masterSecretId } = options;

  return indy.proverCreateMasterSecret(walletHandle, masterSecretId);
}

/** Credential offer에 대한 credential request 생성
 *  이후 이 요청을 issuer에게 보낸다. * */
async function proverCreateCredentialReq(options) {
  const { walletHandle, proverDid, credOffer, credDef, masterSecretId } = options;

  return indy.proverCreateCredentialReq(walletHandle, proverDid, credOffer, credDef, masterSecretId);
}

/** 지갑에 VC 저장 * */
async function proverStoreCredential(options) {
  const { walletHandle, credId, credReqMetadata, cred, credDef, revRegDef } = options;

  return indy.proverStoreCredential(walletHandle, credId, credReqMetadata, cred, credDef, revRegDef);
}

/** 지갑에 저장된 VC 확인 * */
async function proverGetCredentials(options) {
  const { walletHandle, filter } = options;

  return indy.proverGetCredentials(walletHandle, filter);
}

async function generateNonce() {
  return indy.generateNonce();
}

async function proverSearchCredentialsForProofReq(options) {
  const { walletHandle, proofRequest, extraQuery } = options;

  return indy.proverSearchCredentialsForProofReq(walletHandle, proofRequest, extraQuery);
}

async function proverFetchCredentialsForProofReq(options) {
  const { searchHandle, itemReferent, count } = options;

  return indy.proverFetchCredentialsForProofReq(searchHandle, itemReferent, count);
}

async function proverCloseCredentialsSearchForProofReq(options) {
  const { searchHandle } = options;

  return indy.proverCloseCredentialsSearchForProofReq(searchHandle);
}

// 특정 timestamp 에 해당하는 시간에 대한 폐기 정보 생성
async function createRevocationState(options) {
  const { blobStorageReaderHandle, revRegDef, revRegDelta, timestamp, credRevId } = options;

  return indy.createRevocationState(blobStorageReaderHandle, revRegDef, revRegDelta, timestamp, credRevId);
}

// VP 생성
async function proverCreateProof(options) {
  const { walletHandle, proofReq, requestedCredentials, masterSecretName, schemas, credentialDefs, revStates } = options;

  return indy.proverCreateProof(walletHandle, proofReq, requestedCredentials, masterSecretName, schemas, credentialDefs, revStates);
}

async function proverGetCredentialsForProofReq(options) {
  const { walletHandle, proofRequest } = options;

  return indy.proverGetCredentialsForProofReq(walletHandle, proofRequest);
}

async function verifierVerifyProof(options) {
  const { proofRequest, proof, schemas, credentialDefsJsons, revRegDefs, revRegs } = options;

  return indy.verifierVerifyProof(proofRequest, proof, schemas, credentialDefsJsons, revRegDefs, revRegs);
}

module.exports = {
  issuerCreateSchema,
  issuerCreateAndStoreCredentialDef,
  issuerCreateAndStoreRevocReg,
  issuerRevokeCredential,
  issuerCreateCredentialOffer,
  issuerCreateCredential,
  proverCreateMasterSecret,
  proverCreateCredentialReq,
  proverStoreCredential,
  proverGetCredentials,
  proverSearchCredentialsForProofReq,
  proverFetchCredentialsForProofReq,
  proverCloseCredentialsSearchForProofReq,
  proverCreateProof,
  proverGetCredentialsForProofReq,
  generateNonce,
  createRevocationState,
  verifierVerifyProof,
};
