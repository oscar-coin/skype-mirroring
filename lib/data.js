var Consts = require('./consts');
var request = require('request');

var firebaseConnection = "https://" + Consts.FIREBASE_SITE + ".firebaseio.com/";

exports.getChatMetaData = function(id, success, error) {
  var connectionString = firebaseConnection + id + '.json?auth=' + Consts.FIREBASE_SECRET;
  request(connectionString, function (_error, response, body) {
    // console.log(connectionString + " - " + response.statusCode);
    if (_error || response.statusCode != 200) {
      error();
      return;
    }
    if (!body) {
      error();
      return;
    }
    var json = JSON.parse(body);
    if(!json) {
      error();
      return;
    }
    success(JSON.parse(body));
  })
};


