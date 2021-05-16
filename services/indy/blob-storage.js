const indy = require('indy-sdk');

// const utils = require('./utils');
// const config = {
//   'base_dir': `${utils.getIndyStoragePath()}/tails`,
//   'uri_pattern': ''
// }

async function openBlobStorageReader(type, config) {
  return indy.openBlobStorageReader(type, config);
}

async function openBlobStorageWriter(type, config) {
  return indy.openBlobStorageWriter(type, config);
}

// openBlobStorageReader('default', config).then(console.log);
// openBlobStorageWriter('default', config).then(console.log);

module.exports = {
  openBlobStorageWriter,
  openBlobStorageReader,
};
