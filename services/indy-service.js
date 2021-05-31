const indy = require('./indy');

// Did 생성부터 네트워크 전파까지
// walletHandle : 네트워크에 쓸 수 있는 권한을 갖는 DID가 저장된 지갑
// targetWalletHandle : 현재 생성되는 DID가 저장될 위치
async function createDid(poolHandle, walletHandle, options) {
  const { submitterDid, alias, role, targetWalletHandle } = options;
  const [targetDid, verkey] = await indy.did.createAndStoreMyDid(targetWalletHandle, {});

  /** NYM 트랜잭션 생성 * */
  const nymRequest = await indy.ledger.buildNymRequest({
    submitterDid,
    targetDid,
    verkey,
    alias,
    role,
  });
  // console.log(nymRequest);

  /** 서명 및 indy-node에 제출 * */
  const nymResult = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid,
    request: nymRequest,
  });
  // console.log(nymResult);

  return [targetDid, verkey, nymResult];
}

// 네트워크로부터 did 정보 가져오기
async function getDid(poolHandle, options) {
  const { submitterDid, targetDid } = options;

  const getNymRequest = await indy.ledger.buildGetNymRequest({
    submitterDid,
    targetDid,
  });

  const getNymResponse = await indy.ledger.submitRequest({
    poolHandle,
    request: getNymRequest,
  });

  return indy.ledger.parseGetNymResponse(getNymResponse);
}

// 특정 DID의 인증 키 변경 (네트워크 작업 포함)
async function replaceVerkey(poolHandle, walletHandle, options) {
  const { submitterDid, targetDid, alias, role } = options;

  // 대체 인증 생성 -> apply 전에는 딱 한번만 실행 가능 (왜그런지는 잘 모름...)
  const newVerkey = await indy.did.replaceKeysStart(walletHandle, targetDid, {});

  // NYM 리퀘스트 만들어서 노드에 반영
  const nymRequest = await indy.ledger.buildNymRequest({
    submitterDid,
    targetDid,
    verkey: newVerkey,
    alias,
    role,
  });

  const nymResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid,
    request: nymRequest,
  });

  // 변경한 인증키를 지갑에 반영
  await indy.did.replaceKeysApply(walletHandle, targetDid);

  return nymResponse;
}

// schema 생성부터 네트워크 전파까지
async function createSchema(poolHandle, walletHandle, options) {
  const { issuerDid, name, version, attrNames } = options;

  const [id, schema] = await indy.anoncreds.issuerCreateSchema({
    issuerDid,
    name,
    version,
    attrNames,
  });
  // console.log(id, '\n', schema);

  const schemaRequest = await indy.ledger.buildSchemaRequest({
    submitterDid: issuerDid,
    data: schema,
  });
  // console.log(schemaRequest);

  const schemaResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: schemaRequest,
  });
  // console.log(id, schemaResponse);

  return id;
}

// 네트워크로부터 Schema 정보 가져오기
async function getSchema(poolHandle, walletHandle, options) {
  const { issuerDid, schemaId } = options;

  const getSchemaRequest = await indy.ledger.buildGetSchemaRequest({
    submitterDid: issuerDid,
    id: schemaId,
  });
  // console.log(getSchemaRequest);

  const getSchemaResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: getSchemaRequest,
  });
  // console.log(getSchemaResponse); // seqNo 필드가 null이 아닌 경우에 Schema가 존재하는 것인듯.

  const ret = await indy.ledger.parseGetSchemaResponse(getSchemaResponse);

  return {
    id: ret[0],
    schema: ret[1],
  };
}

// credential definition 생성부터 전파까지
async function createCredentialDefinition(poolHandle, walletHandle, options) {
  const { schema, tag, issuerDid } = options;

  const [credDefId, credDef] = await indy.anoncreds.issuerCreateAndStoreCredentialDef({
    walletHandle,
    issuerDid,
    schema,
    tag,
    signatureType: 'CL',
    config: {
      support_revocation: true,
    },
  });
  // console.log(credDefId, credDef);

  const credDefRequest = await indy.ledger.buildCredDefRequest({
    submitterDid: issuerDid,
    data: credDef,
  });
  // console.log(credDefRequest);

  const credDefResult = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: credDefRequest,
  });
  // console.log(credDefResult);

  return credDefId;
}

// 네트워크에서 credential definition 정보 가져오기
async function getCredDef(poolHandle, walletHandle, options) {
  const { issuerDid, credDefId } = options;

  const getCreDefRequest = await indy.ledger.buildGetCredDefRequest({
    submitterDid: issuerDid,
    id: credDefId,
  });
  // console.log(getCreDefRequest);

  const getCredDefResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: getCreDefRequest,
  });
  // console.log(getCredDefResponse);

  const ret = await indy.ledger.parseGetCredDefResponse(getCredDefResponse);
  console.log(ret);

  return {
    id: ret[0],
    credDef: ret[1],
  };
}

async function createRevocationRegistry(poolHandle, walletHandle, options) {
  const { issuerDid, credDefId, maxCredNum } = options;

  const tailsWriterHandle = await indy.blobStorage.openBlobStorageWriter('default', {
    base_dir: `${indy.utils.getIndyStoragePath()}/tails`,
    uri_pattern: '',
  });
  // console.log('tailsWriterHandle \n', tailsWriterHandle);

  const [revocRegId, revocRegDef, revocRegEntry] = await indy.anoncreds.issuerCreateAndStoreRevocReg({
    walletHandle,
    issuerDid,
    revocDefType: null,
    tag: 'test_revocation_registry',
    credDefId,
    config: {
      max_cred_num: maxCredNum,
    },
    tailsWriterHandle,
  });
  // console.log('revocReqId\n', revocRegId);
  // console.log('revocReqDef\n', revocRegDef);
  // console.log('revocRegEntry\n', revocRegEntry);

  const revocRegDefRequest = await indy.ledger.buildRevocRegDefRequest({
    submitterDid: issuerDid,
    data: revocRegDef,
  });
  // console.log('revocRegDefRequest\n', revocRegDefRequest);

  const revocRegDefResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: revocRegDefRequest,
  });
  // console.log('revocRegDefResponse\n', revocRegDefResponse);

  return revocRegId;
}

async function getRevocRegDef(poolHandle, walletHandle, options) {
  const { issuerDid, revocRegDefId } = options;

  const getRevocRegDefRequest = await indy.ledger.buildGetRevocRegDefRequest({
    submitterDid: issuerDid,
    id: revocRegDefId,
  });
  // console.log('getRevocRegDefRequest\n', getRevocRegDefRequest);

  const getRevocRegDefResponse = await indy.ledger.submitRequest({
    poolHandle,
    request: getRevocRegDefRequest,
  });
  // console.log(getRevocRegDefResponse);

  const ret = await indy.ledger.parseGetRevocRegDefResponse(getRevocRegDefResponse);

  return {
    id: ret[0],
    revocRegDef: ret[1],
  };
}

async function createVC(poolHandle, walletHandle, options) {
  const { credOffer, credReq, revRegId, credValues } = options;

  const tailsReaderHandle = await indy.blobStorage.openBlobStorageReader('default', {
    base_dir: `${indy.utils.getIndyStoragePath()}/tails`,
    uri_pattern: '',
  });
  // console.log('tailsReaderHandle \n', tailsReaderHandle);

  const [cred, credRevocId, revocRegDelta] = await indy.anoncreds.issuerCreateCredential({
    walletHandle,
    credOffer,
    credReq,
    credValues,
    revRegId,
    blobStorageReaderHandle: tailsReaderHandle,
  });
  // console.log('cred\n', cred);
  // console.log('credRevocId\n', credRevocId);
  // console.log('revocRegDelta\n', revocRegDelta);

  return {
    cred,
    credRevocId,
    revocRegDelta,
  };
}

async function storeVC(walletHandle, options) {
  const { credReqMetadata, cred, credDef, revRegDef } = options;

  const outCredId = await indy.anoncreds.proverStoreCredential({
    walletHandle,
    credId: undefined,
    credReqMetadata,
    cred,
    credDef,
    revRegDef,
  });
  // console.log(outCredId);
  return outCredId;
}

async function createProofReq(proofRequest) {
  const nonce = await indy.anoncreds.generateNonce();

  return {
    ...proofRequest,
    nonce,
  };
}


module.exports = {
  createDid,
  createSchema,
  createCredentialDefinition,
  createRevocationRegistry,
  createVC,
  getDid,
  replaceVerkey,
  getSchema,
  getCredDef,
  getRevocRegDef,
  storeVC,
  createProofReq,
};
