/** anocres: Anonymous credentials * */
const indy = require('indy-sdk');

/** Schema 생성 * */
async function issuerCreateSchema(options) {
  const { issuerDid, name, version, attrNames } = options;

  return indy.issuerCreateSchema(issuerDid, name, version, attrNames);
}

async function issuerCreateAndStoreCredentialDef(options) {
  const { walletHandle, issuerDid, schema, tag, signatureType, config } = options;

  return indy.issuerCreateAndStoreCredentialDef(walletHandle, issuerDid, schema, tag, signatureType, config);
}

module.exports = {
  issuerCreateSchema,
  issuerCreateAndStoreCredentialDef,
};
