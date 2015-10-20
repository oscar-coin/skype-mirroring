var Skyweb = require('skyweb');
var Consts = require('./consts');
var Sender = require('./sender');
var Data = require('./data');
var sha1 = require('sha1');

if (!Consts.SKYPE_USERNAME || !Consts.SKYPE_PASSWORD) {
  throw new Error('Username and password should be provided!');
}

var skyweb = new Skyweb();
skyweb.login(Consts.SKYPE_USERNAME, Consts.SKYPE_PASSWORD).then(function () {
  console.log('Cheers. Skype bot is now initialized...');
});

skyweb.messagesCallback = function (messages) {
  messages.forEach(function (message) {
    if (message.resource.from.indexOf(Consts.SKYPE_USERNAME) === -1 &&
      message.resourceType == "NewMessage") {
      var content = message.resource.content;
      var id = formatUniqueId(message.resource.conversationLink);
      var sender = formatUniqueName(message.resource.from);
      Data.getChatMetaData(id, function (data) {
        if (data && data["mailing_enabled"] == true) {
          var fromObj = findSender(data, sender);
          var to = formatTo(data, fromObj);
          var from = formatMember(fromObj);

          Sender.sendMail(data["mailing_endpoint"], from, to, data["mailing_subject"], content, function() {
            console.log("Ups. Something went wrong when sending emails.")
          });
        }
      }, function() {
        console.log("Error! (MessageId: "+id+")");
      })
    }
  });
};

function findSender(data, skype) {
  for (var x in data["members"]) {
    var current = data["members"][x];
    if (current["skype"] == skype) {
      return current;
    }
  }
}

function formatTo(data, receiver) {
  var out = "";
  for (var x in data["members"]) {
    if (out) {
      out += ", ";
    }
    var current = data["members"][x];
    if (current == receiver) {
      continue;
    }
    out += formatMember(current);
  }
  return out;
}

function formatMember(member) {
  return member["name"] + " <" + member["mail"] + ">";
}

function formatUniqueId(id) {
  var preStringLength = 'https://db3-client-s.gateway.messenger.live.com/v1/users/ME/conversations/'.length;
  var thread = id.substr(preStringLength);
  return sha1(thread);
}

function formatUniqueName(from) {
  var preStringLength = 'https://db3-client-s.gateway.messenger.live.com/v1/users/ME/contacts/'.length+2;
  return from.substr(preStringLength);
}
