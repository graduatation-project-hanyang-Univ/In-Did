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
        tag: 'test_tag_support_revocation',
        signatureType: 'CL',
        config: {
          support_revocation: true,
        },
      });
      console.log(credDefId, credDef);

      const credDefRequest = await indy.ledger.buildCredDefRequest({
        submitterDid: issuerDid,
        data: credDef,
      });
      console.log(credDefRequest);

      const credDefResult = await indy.ledger.signAndSubmitRequest({
        poolHandle,
        walletHandle,
        submitterDid: issuerDid,
        request: credDefRequest,
      });
      console.log(credDefResult);
    });

    test('Credential Definition 조회 테스트', async () => {
      const id = 'Ax5BNed9CRETKWTVNxNef9:3:CL:32:test_tag';

      const getCreDefRequest = await indy.ledger.buildGetCredDefRequest({
        submitterDid: issuerDid,
        id,
      });
      console.log(getCreDefRequest);

      const getCredDefResponse = await indy.ledger.signAndSubmitRequest({
        poolHandle,
        walletHandle,
        submitterDid: issuerDid,
        request: getCreDefRequest,
      });
      console.log(getCredDefResponse);
    });
  });
});

describe('VC Revocation Registry 생성', () => {
  let walletHandle;
  let poolHandle;

  const issuerDid = 'Ax5BNed9CRETKWTVNxNef9';
  const config = { id: 'test_wallet4' };
  const credentials = { key: 'test_wallet_key' };
  const credDefId = 'Ax5BNed9CRETKWTVNxNef9:3:CL:32:test_tag_support_revocation';

  beforeAll(async () => {
    poolHandle = await indy.pool.getPoolHandle();
    walletHandle = await indy.wallet.openWallet(config, credentials);
  });

  afterAll(async () => {
    await indy.wallet.closeWallet(walletHandle);
    await indy.pool.closePoolLedger(poolHandle);
  });

  test('VC Revocation Registry 생성 테스트 - 타겟 credDef 가 생성 시에 support_revocation: true 여야 한다.', async () => {
    const tailsWriterHandle = await indy.blobStorage.openBlobStorageWriter('default', {
      base_dir: `${indy.utils.getIndyStoragePath()}/tails`,
      uri_pattern: '',
    });
    console.log('tailsWriterHandle \n', tailsWriterHandle);

    const [revocRegId, revocRegDef, revocRegEntry] = await indy.anoncreds.issuerCreateAndStoreRevocReg({
      walletHandle,
      issuerDid,
      revocDefType: null,
      tag: 'test_revocation_registry',
      credDefId,
      config: {
        max_cred_num: 1000,
      },
      tailsWriterHandle,
    });
    console.log('revocReqId\n', revocRegId);
    console.log('revocReqDef\n', revocRegDef);
    console.log('revocRegEntry\n', revocRegEntry);

    const revocRegDefRequest = await indy.ledger.buildRevocRegDefRequest({
      submitterDid: issuerDid,
      data: revocRegDef,
    });
    console.log('revocRegDefRequest\n', revocRegDefRequest);

    const revocRegDefResponse = await indy.ledger.signAndSubmitRequest({
      poolHandle,
      walletHandle,
      submitterDid: issuerDid,
      request: revocRegDefRequest,
    });
    console.log('revocRegDefResponse\n', revocRegDefResponse);
  });
});

describe('VC 생성 테스트', () => {
  let walletHandle;
  let poolHandle;
  let credOffer;

  const issuerDid = 'Ax5BNed9CRETKWTVNxNef9';
  const credDefId = 'Ax5BNed9CRETKWTVNxNef9:3:CL:32:test_tag';
  const config = { id: 'test_wallet4' };
  const credentials = { key: 'test_wallet_key' };

  beforeAll(async () => {
    poolHandle = await indy.pool.getPoolHandle();
    walletHandle = await indy.wallet.openWallet(config, credentials);

    // issuer 관점에서 미리 credOffer 생성해두는 코드
    credOffer = await indy.anoncreds.issuerCreateCredentialOffer({
      walletHandle,
      credDefId,
    });
  });

  afterAll(async () => {
    await indy.wallet.closeWallet(walletHandle);
    await indy.pool.closePoolLedger(poolHandle);
  });

  test('VC 요청 생성 테스트 - issuer == prover 인 경우로 테스팅', async () => {
    // 1. master secret (현재 link secret) 생성 - prover
    const outMasterSecretId = await indy.anoncreds.proverCreateMasterSecret({
      walletHandle,
    });
    console.log('outMasterSecretId\n', outMasterSecretId);

    // 2. 미리만들어놓은 credOffer 이용해 credDef 가져오기 - prover
    const getCredDefRequest = await indy.ledger.buildGetCredDefRequest({
      id: credOffer.cred_def_id,
    });
    console.log('getCredDefRequest\n', getCredDefRequest);

    const getCredDefResponse = await indy.ledger.submitRequest({
      poolHandle,
      request: getCredDefRequest,
    });
    console.log('getCredDefResponse\n', getCredDefResponse);

    const [, credDef] = await indy.ledger.parseGetCredDefResponse(getCredDefResponse);
    console.log('credDef\n', credDef);

    // 3. VC 발급 요청 데이터를 생성 - prover
    const [credReq, credReqMetadata] = await indy.anoncreds.proverCreateCredentialReq({
      walletHandle,
      proverDid: issuerDid,
      credOffer,
      credDef,
      masterSecretId: outMasterSecretId,
    });
    console.log('credReq\n', credReq);
    console.log('credReqMetadata\n', credReqMetadata);

    /** 이 부분 안됨 - revocation 부분 관련해서 먼저 해줘야 하는 게 있는 듯. * */
    // 4. VC 생성 - issuer
    const [cred, credRevocId, revocRegDelta] = await indy.anoncreds.issuerCreateCredential({
      walletHandle,
      credOffer,
      credReq,
      credValues: {
        age: {
          raw: 20,
          encoded: '20', // 인코딩을 인디에서 자체적으로 처리해주지 않음. IS-786?
        },
        sex: {
          raw: 1,
          encoded: '1',
        },
        height: {
          raw: 180,
          encoded: '180',
        },
        name: {
          raw: 1,
          encoded: '1',
        },
      },
      // revReqId: null,
      blobStorageReaderHandle: 0,
    });
    console.log('cred\n', cred);

    // 5. VC 저장 - prover
    // const outCredId = await indy.anoncreds.proverStoreCredential({
    //   walletHandle,
    //   credId: undefined,
    //   credReqMetadata,
    //   cred, // 채워져야 함,
    //   credDef,
    //   revRegDef, // 채워져야 함
    // });
    // console.log(outCredId);
  });
});
