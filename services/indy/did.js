const indy = require('indy-sdk');

/** DID를 생성만하고, 실제로 레저에 올리지는 않은 상태 * */
async function createAndStoreMyDid(walletHandle, did) {
  return indy.createAndStoreMyDid(walletHandle, did);
}
/** 인증키 변경을 원하는 DID를 선택 후 새로운 비대칭키 쌍을 생성 * */
async function replaceKeysStart(walletHandle, did, identity) {
  return indy.replaceKeysStart(walletHandle, did, identity);
}

/** 기존 DID의 키 쌍을 삭제하고 새로 생성한 키 쌍을 등록 - 인디 노드에 반영되지는 않는다. * */
async function replaceKeysApply(walletHandle, did) {
  indy.replaceKeysApply(walletHandle, did);
}

/** 해당 DID에 해당하는 DID document에 serviceEndpoint를 추가
 *  address 매개변수에 서비스 URL 입력하여 추가 가능
 * * */
async function setEndpointForDid(walletHandle, did, address, transportKey) {
  indy.setEndpointForDid(walletHandle, did, address, transportKey);
}

module.exports = {
  createAndStoreMyDid,
  replaceKeysStart,
  replaceKeysApply,
  setEndpointForDid,
};
