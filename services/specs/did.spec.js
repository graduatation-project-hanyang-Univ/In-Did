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
});
