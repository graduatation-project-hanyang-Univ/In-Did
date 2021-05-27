const indy = require('../indy');
const indyService = require('../indy-service');

const stewardSeed = '000000000000000000000000Steward1';
const config = { id: 'test_for_did_spec' };
const credentials = { key: 'test_wallet_key' };

describe('테스트', () => {
  let poolHandle;
  let walletHandle;
  let stewardDid;
  let stewardVerkey;
  let endorserDid;
  let endorserVerkey;
  let schemaObj; // id, schema 필드
  let credDefObj; // id, credDef 필드
  let revocRegDefObj; // id, revocRegDef 필드

  beforeAll(async () => {
    poolHandle = await indy.pool.getPoolHandle();
    await indy.wallet.createWallet(config, credentials);
    walletHandle = await indy.wallet.openWallet(config, credentials);
  });

  afterAll(async () => {
    await indy.wallet.closeWallet(walletHandle);
    await indy.wallet.deleteWallet(config, credentials);
    await indy.pool.closePoolLedger(poolHandle);
  });

  describe('DID 핸들링 관련', () => {
    test('stewatd 정보 가져오기', async () => {
      /** steward 정보 가져옴 - 인디노드에 반영하는 주체 * */
      [stewardDid, stewardVerkey] = await indy.did.createAndStoreMyDid(walletHandle, {
        seed: stewardSeed,
      });
      console.log(stewardDid, stewardVerkey);
    });

    test('Endorser Did 생성', async () => {
      [endorserDid, endorserVerkey] = await indyService.createDid(poolHandle, walletHandle, {
        submitterDid: stewardDid,
        alias: undefined,
        role: 'ENDORSER',
        targetWalletHandle: walletHandle,
      });
      console.log(endorserDid, endorserVerkey);
    });

    test('네트워크로부터 생성한 DID 정보 가져오기', async () => {
      /** 클라이언트 역할용 DID 생성 (검색용으로, 실제 노드에 반영 X) * */
      const [clientDid, clientVerkey] = await indy.did.createAndStoreMyDid(walletHandle, {});
      console.log(clientDid, clientVerkey);

      const res = await indyService.getDid(poolHandle, {
        submitterDid: clientDid,
        targetDid: endorserDid,
      });
      console.log(res);
    });

    test('지갑의 Did 확인', async () => {
      const list = await indy.did.listMyDidsWithMeta(walletHandle);
      console.log(list);
    });

    test('Endorser Did 인증 키 변경', async () => {
      await indyService.replaceVerkey(poolHandle, walletHandle, {
        submitterDid: endorserDid,
        targetDid: endorserDid,
        alias: undefined,
        role: 'ENDORSER',
      });
    });

    test('인증 키 변경 후 지갑의 Did 확인', async () => {
      const list = await indy.did.listMyDidsWithMeta(walletHandle);
      console.log(list);
    });
  });

  describe('Schema 관련', () => {
    let schemaId;
    test('Schema 생성', async () => {
      schemaId = await indyService.createSchema(poolHandle, walletHandle, {
        issuerDid: endorserDid,
        name: 'schema_test',
        version: '1.0',
        attrNames: ['age', 'sex', 'height', 'name'],
      });
      console.log(schemaId);
    });

    test('Schema 조회', async () => {
      schemaObj = await indyService.getSchema(poolHandle, walletHandle, {
        issuerDid: endorserDid,
        schemaId,
      });
      console.log(schemaObj);
    });
  });

  describe('Credential Definition 관련', () => {
    let credDefId;
    test('Credential Definition 생성', async () => {
      credDefId = await indyService.createCredentialDefinition(poolHandle, walletHandle, {
        schema: schemaObj.schema,
        tag: 'test_tag_support_revocation',
        issuerDid: endorserDid,
      });
    });

    test('Credential Definition 조회', async () => {
      credDefObj = await indyService.getCredDef(poolHandle, walletHandle, {
        issuerDid: endorserDid,
        credDefId,
      });
      console.log(credDefObj);
    });
  });

  describe('Revocation Registry 관련', () => {
    let revocRegDefId;
    test('Revocation Registry 생성', async () => {
      revocRegDefId = await indyService.createRevocationRegistry(poolHandle, walletHandle, {
        issuerDid: endorserDid,
        credDefId: credDefObj.id,
        naxCredNum: 10,
      });
      console.log(revocRegDefId);
    });

    test('Revocation Registry 조회', async () => {
      revocRegDefObj = await indyService.getRevocRegDef(poolHandle, walletHandle, {
        issuerDid: endorserDid,
        revocRegDefId,
      });
      console.log(revocRegDefObj);
    });
  });

  describe('VC 관련', () => {
    const proverConfig = { id: 'test_for_did_spec_prover' };
    const proverCredentials = { key: 'test_wallet_key' };
    let credOffer;
    let proverWalletHandle; // prover용 지갑 생성
    let proverDid;
    let proverVerkey;
    let outMasterSecretId;
    let credReq;
    let credReqMetadata;
    let vcObj; // cred, credRevocId, revocRegDelta 필드
    let outCredId;

    beforeAll(async () => {
      await indy.wallet.createWallet(proverConfig, proverCredentials);
      proverWalletHandle = await indy.wallet.openWallet(proverConfig, proverCredentials);
    });

    afterAll(async () => {
      await indy.wallet.closeWallet(proverWalletHandle);
      await indy.wallet.deleteWallet(proverConfig, proverCredentials);
    });

    test('common user 권한으로 prover DID 생성', async () => {
      [proverDid, proverVerkey] = await indyService.createDid(poolHandle, walletHandle, {
        submitterDid: endorserDid,
        alias: undefined,
        role: undefined,
        targetWalletHandle: proverWalletHandle,
      });
      console.log(proverDid, proverVerkey);
    });

    test('issuer에서 credOffer 생성', async () => {
      credOffer = await indy.anoncreds.issuerCreateCredentialOffer({
        walletHandle,
        credDefId: credDefObj.id,
      });
      console.log(credOffer);
    });

    test('prover에서 link secret(master secret) 생성', async () => {
      outMasterSecretId = await indy.anoncreds.proverCreateMasterSecret({
        walletHandle: proverWalletHandle,
      });
      console.log('outMasterSecretId\n', outMasterSecretId);
    });

    test('prover에서 VC 발급 요청 데이터를 생성', async () => {
      [credReq, credReqMetadata] = await indy.anoncreds.proverCreateCredentialReq({
        walletHandle: proverWalletHandle,
        proverDid,
        credOffer,
        credDef: credDefObj.credDef,
        masterSecretId: outMasterSecretId,
      });
      console.log('credReq\n', credReq);
      console.log('credReqMetadata\n', credReqMetadata);
    });

    test('issuer에서 VC 생성', async () => {
      const credValues = {
        age: {
          raw: '20',
          encoded: '20', // 인코딩을 인디에서 자체적으로 처리해주지 않음. IS-786?
        },
        sex: {
          raw: '1',
          encoded: '1',
        },
        height: {
          raw: '190',
          encoded: '190',
        },
        name: {
          raw: '1',
          encoded: '1',
        },
      };

      vcObj = await indyService.createVC(poolHandle, walletHandle, {
        credOffer,
        credReq,
        revRegId: revocRegDefObj.id,
        credValues,
      });
      console.log(vcObj);
    });

    test('prover 지갑에 생성된 VC 저장', async () => {
      outCredId = await indyService.storeVC(proverWalletHandle, {
        credReqMetadata,
        cred: vcObj.cred,
        credDef: credDefObj.credDef,
        revRegDef: revocRegDefObj.revocRegDef,
      });
      console.log(outCredId);
    });

    test('prover 지갑에 저장된 VC 확인', async () => {
      const list = await indy.anoncreds.proverGetCredentials({
        walletHandle: proverWalletHandle,
      });
      console.log(list);
    });
  });
});
