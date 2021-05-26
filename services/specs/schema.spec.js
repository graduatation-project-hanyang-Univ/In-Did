const indy = require('../indy');

describe('Schema 테스트', () => {
  let poolHandle;
  const stewardSeed = '000000000000000000000000Steward1';

  beforeAll(async () => {
    poolHandle = await indy.pool.getPoolHandle();
  });

  afterAll(async () => {
    await indy.pool.closePoolLedger(poolHandle);
  });

  test('테스트 코드 작성', async () => {
    console.log('test!');
  });
});
