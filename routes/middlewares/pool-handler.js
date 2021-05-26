/** API 접근 시, pool 열어서 핸들링해줌 * */
const indy = require('../../services/indy');

module.exports = async (req, res, next) => {
  try {
    const poolHandle = await indy.pool.getPoolHandle();
    req.poolHandle = poolHandle;
    return next();
  } catch (e) {
    return next(e);
  }
};
