var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var Consts = require('./consts');

var options = {
  auth: {
    api_user: Consts.SENDGRID_USERNAME,
    api_key: Consts.SENDGRID_PASSWORD
  }
};

var client = nodemailer.createTransport(sgTransport(options));

exports.sendMail = function(from, receiver, to, subject, content, error) {
  var mail = {
    from: from,
    to: receiver,
    headers: { 'To' : to },
    subject: subject,
    text: content
  };

  //console.log(mail);

  client.sendMail(mail , function (_error) {
    //console.log(_error);
    if (_error) {
      error();
      return;
    }
  });
};
