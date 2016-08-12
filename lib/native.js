
// (c) oblong industries

'use strict';

let buildType = process.env.GELATIN_DEBUG ? 'Debug' : 'Release';
module.exports = require('../build/' + buildType + '/gelatin.node');
