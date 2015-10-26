var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Consts = require('./consts');
var sha1 = require('sha1');

mongoose.connect(Consts.MONGOLAB_DB);

var personSchema = new Schema({
  name: String,
  alias: String,
  uid: String
});

var messageSchema = new Schema({
  _composer: { type: Schema.Types.ObjectId, ref: 'Person' },
  _chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  content: String,
  composedAt: Date
});

var chatSchema = new Schema({
  threadName: String,
  uid: String
});

var Message = mongoose.model('Message', messageSchema);
var Chat = mongoose.model('Chat', chatSchema);
var Person = mongoose.model('Person', personSchema);

exports.saveMessage = function (msg, callback) {
  getOrCreateChat(msg, function (error, chat) {
    if (error) {
      return callback(error);
    }
    getOrCreatePerson(msg, function (_error, person) {
      if (_error) {
        return callback(_error);
      }
      var message = new Message({
        content: msg.resource.content,
        composedAt: msg.resource.composetime,
        _chat: chat._id,
        _composer: person._id
      });
      return message.save(function (__error) {
        if (__error) {
          return callback(__error);
        }
        callback(null);
      });
    });
  });
};

function getOrCreateChat(msg, callback) {
  Chat.findOne({ uid: formatConversationLink(msg.resource.conversationLink) }, function (error, chat) {
    if (error) {
      return callback(error);
    }
    var sender = formatAlias(msg.resource.from);
    var threadName;
    if (msg.resource.threadtopic) {
      threadName = msg.resource.threadtopic;
    } else {
      threadName = sender;
    }
    if (!chat) {
      chat = new Chat({
        threadName: threadName,
        uid: formatConversationLink(msg.resource.conversationLink)
      });
      return chat.save(function (_error, _chat) {
        if (_error) {
          return callback(_error);
        }
        callback(null, _chat);
      });
    }
    if (chat.threadName !== threadName) {
      chat.threadName = threadName;
    }
    callback(null, chat);
  });
}

function getOrCreatePerson(msg, callback) {
  var sender = formatAlias(msg.resource.from);
  Person.findOne({ alias: sender }, function (error, person) {
    if (error) {
      return callback(error);
    }
    if (!person) {
      person = new Person({
        name: msg.resource.imdisplayname,
        uid: formatConversationLink(msg.resource.from),
        alias: sender
      });
      return person.save(function (_error, _person) {
        if (_error) {
          return callback(_error);
        }
        callback(null, _person);
      });
    }
    callback(null, person);
  });
}

function formatConversationLink(link) {
  return sha1(link);
}

function formatAlias(alias) {
  var preStringLength = 'https://db3-client-s.gateway.messenger.live.com/v1/users/ME/contacts/'.length + 2;
  return alias.substr(preStringLength);
}
