const indy = require('../indy');

const stewardSeed = '000000000000000000000000Steward1';
const config = { id: 'test_for_template' };
const credentials = { key: 'test_wallet_key' };

describe('테스트 템플릿', () => {
  let poolHandle;
  let walletHandle;

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

  test('테스트 코드 작성', async () => {
    console.log('test!');
  });
});
