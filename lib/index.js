var Skyweb = require('skyweb');
var Consts = require('./consts');
var Data = require('./data');

if (!Consts.SKYPE_USERNAME || !Consts.SKYPE_PASSWORD) {
  throw new Error('Username and password should be provided.');
}

var skyweb = new Skyweb();
skyweb.login(Consts.SKYPE_USERNAME, Consts.SKYPE_PASSWORD).then(function () {
  console.log('Cheers. Skype bot is now initialized...');
});

skyweb.messagesCallback = function (messages) {
  messages.forEach(function (message) {
    if (message.resource.from.indexOf(Consts.SKYPE_USERNAME) === -1 && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping' &&
      message.resourceType === 'NewMessage') {
      Data.saveMessage(message, function (error) {
        if (error) {
          return console.log(error);
        }
      });
    }
  });
};
