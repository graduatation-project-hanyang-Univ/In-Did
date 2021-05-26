const indy = require('./indy');

// Did 생성부터 네트워크 전파까지
async function createDid(poolHandle, walletHandle, options) {
  const { submitterDid, alias, role } = options;
  const [targetDid, verkey] = await indy.did.createAndStoreMyDid(walletHandle, {});

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

// schema 생성부터 네트워크 전파까지
async function createSchema(poolHandle, walletHandle, options) {
  const { issuerDid, name, version, attrNames } = options;

  const [id, schema] = await indy.anoncreds.issuerCreateSchema({
    issuerDid,
    name,
    version,
    attrNames,
  });

  const schemaRequest = await indy.ledger.buildSchemaRequest({
    submitterDid: issuerDid,
    data: schema,
  });
  const schemaResponse = await indy.ledger.signAndSubmitRequest({
    poolHandle,
    walletHandle,
    submitterDid: issuerDid,
    request: schemaRequest,
  });

  return [id, schemaResponse];
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

module.exports = {
  createDid,
  createSchema,
  getDid,
  replaceVerkey,
};
