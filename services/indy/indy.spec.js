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
});
