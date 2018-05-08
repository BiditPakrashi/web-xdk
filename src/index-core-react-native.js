/* eslint-disable import/first */
import './utils/native-support/react-native';
import { Core, Utils, Constants, init, onInit, version, client, Settings } from './index-core';
import './ui/messages/index-models';

module.exports = {
  Core,
  Utils,
  Constants,
  init,
  onInit,
  version: version + '-react-native',
  client,
  Settings,
};
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;
