const indy = require('./index');

describe('테스트', () => {
  let poolHandle;
  const stewardSeed = '000000000000000000000000Steward1';

  beforeAll(async () => {
    poolHandle = await indy.pool.getPoolHandle();
  });

  afterAll(async () => {
    await indy.pool.closePoolLedger(poolHandle);
  });

  test('지갑 생성 테스트', async () => {
    const config = { id: 'test_wallet5' };
    const credentials = { key: 'test_wallet_key' };

    await indy.wallet.createWallet(config, credentials);

    console.log('success');
  });

  test('DID 확인 테스트', async () => {
    const config = { id: 'test_wallet4' };
    const credentials = { key: 'test_wallet_key' };
    const walletHandle = await indy.wallet.openWallet(config, credentials);

    const list = await indy.did.listMyDidsWithMeta(walletHandle);
    console.log(list);
  });

  test('DID 및 DID document 생성 및 인증키 변경 테스트', async () => {
    /** 지갑 열기 * */
    const config = { id: 'test_wallet4' };
    const credentials = { key: 'test_wallet_key' };
    const walletHandle = await indy.wallet.openWallet(config, credentials);
    // console.log(walletHandle);

    /** steward 정보 가져옴 - 인디노드에 반영하는 주체 * */
    const [stewardDid, stewardVerkey] = await indy.did.createAndStoreMyDid(walletHandle, {
      seed: stewardSeed,
    });
    // console.log(stewardDid, stewardVerkey);

    /** Endorser 역할을 할 DID 정보 생성 * */
    const [endorserDid, endorserVerkey] = await indy.did.createAndStoreMyDid(walletHandle, {});
    // console.log(endorserDid, endorserVerKey);

    /** NYM 트랜잭션 생성 * */
    let nymRequest = await indy.ledger.buildNymRequest({
      submitterDid: stewardDid,
      targetDid: endorserDid,
      verkey: endorserVerkey,
      alias: undefined,
      role: 'ENDORSER',
    });
    // console.log(nymRequest);

    /** 서명 및 indy-node에 제출 * */
    let nymResult = await indy.ledger.signAndSubmitRequest({
      poolHandle,
      walletHandle,
      submitterDid: stewardDid,
      request: nymRequest,
    });
    // console.log(nymResult);

    /** 클라이언트 역할용 DID 생성 (검색용으로, 실제 노드에 반영 X) * */
    const [clientDid, clientVerkey] = await indy.did.createAndStoreMyDid(walletHandle, {});
    // console.log(clientDid, clientVerkey);

    const getNymRequest = await indy.ledger.buildGetNymRequest({
      submitterDid: clientDid,
      targetDid: endorserDid,
    });
    // console.log(getNymRequest);

    const getNymResponse = await indy.ledger.submitRequest({
      poolHandle,
      request: getNymRequest,
    });
    // console.log(getNymResponse);

    /** Endorser DID 인증키 변경 * */
    // 대체 인증 생성 -> apply 전에는 딱 한번만 실행 가능 (왜그런지는 잘 모름...)
    const newVerkey = await indy.did.replaceKeysStart(walletHandle, endorserDid, {});
    // console.log(newVerkey);

    // NYM 리퀘스트 만들어서 노드에 반영
    nymRequest = await indy.ledger.buildNymRequest({
      submitterDid: endorserDid,
      targetDid: endorserDid,
      verkey: newVerkey,
      alias: undefined,
      role: 'TRUST_ANCHOR',
    });

    nymResult = await indy.ledger.signAndSubmitRequest({
      poolHandle,
      walletHandle,
      submitterDid: endorserDid,
      request: nymRequest,
    });
    // console.log(nymResult);
    // 변경한 인증키를 지갑에 반영
    await indy.did.replaceKeysApply(walletHandle, endorserDid);

    await indy.wallet.closeWallet(walletHandle);
  });

  describe('Schema 생성 및 Credential Definition 생성', () => {
    const issuerDid = 'Ax5BNed9CRETKWTVNxNef9';
    /** 지갑 열기 * */
    const config = { id: 'test_wallet4' };
    const credentials = { key: 'test_wallet_key' };
    let walletHandle;

    beforeAll(async () => {
      walletHandle = await indy.wallet.openWallet(config, credentials);
    });

    afterAll(async () => {
      await indy.wallet.closeWallet(walletHandle);
    });

    test('Schema 생성 테스트 - 같은 버전으론 한 번만 가능', async () => {
      const [id, schema] = await indy.anoncreds.issuerCreateSchema({
        issuerDid,
        name: 'schema_test',
        version: '1.4',
        attrNames: ['age', 'sex', 'height', 'name'],
      });
      // console.log(id, '\n', schema);

      const schemaRequest = await indy.ledger.buildSchemaRequest({
        submitterDid: issuerDid,
        data: schema,
      });
      console.log(schemaRequest);

      const schemaResponse = await indy.ledger.signAndSubmitRequest({
        poolHandle,
        walletHandle,
        submitterDid: issuerDid,
        request: schemaRequest,
      });
      console.log(id, schemaResponse);
    });

    test('Schema 조회 테스트', async () => {
      const id = 'Ax5BNed9CRETKWTVNxNef9:2:schema_test:1.4';

      const getSchemaRequest = await indy.ledger.buildGetSchemaRequest({
        submitterDid: issuerDid,
        id,
      });
      console.log(getSchemaRequest);

      const getSchemaResponse = await indy.ledger.signAndSubmitRequest({
        poolHandle,
        walletHandle,
        submitterDid: issuerDid,
        request: getSchemaRequest,
      });
      console.log(getSchemaResponse); // seqNo 필드가 null이 아닌 경우에 Schema가 존재하는 것인듯.
    });

    test('Credential Definition 생성 테스트', async () => {
      const schema = {
        id: '32', // 해당 스케마 트랜잭션의 sequence 넘버 넣어야 한다.
        ver: '1.0', // 고정인듯?
        name: 'schema_test', // 왜넣는지 모름
        version: '1.3', // 왜넣는지 모름
        attrNames: ['age', 'sex', 'height', 'name'], // 왜넣는지 모름
      };

      const [credDefId, credDef] = await indy.anoncreds.issuerCreateAndStoreCredentialDef({
        walletHandle,
        issuerDid,
        schema,
        tag: 'test_tag',
        signatureType: 'CL',
        config: {
          support_revocation: false,
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
    });
  });
});
