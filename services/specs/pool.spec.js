const indy = require('../indy');

describe('pool 연동 관련', () => {
  test('풀 생성', async () => {
    await indy.pool.createGenesisLedger();

    const list = await indy.pool.listPools();
    console.log(list);
  });

  test('poolHandle 조회', async () => {
    const ph = await indy.pool.getPoolHandle();
    console.log(ph);
  });

  test('풀 삭제', async () => {
    await indy.pool.deletePoolLedgerConfig();

    const list = await indy.pool.listPools();
    console.log(list);
  });
});
