/**
 * Created by Christian Westhoff
 * @type {*|exports|module.exports}
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Consts = require('./../settings.json');
var sha1 = require('sha1');

mongoose.connect(Consts.MONGOLAB_DB);

var personSchema = new Schema({
  name: String,
  alias: String,
  uid: String
}, { collection: 'skype_person' });

var messageSchema = new Schema({
  _composer: { type: Schema.Types.ObjectId, ref: 'Person' },
  _thread: { type: Schema.Types.ObjectId, ref: 'Thread' },
  content: String,
  composedAt: Date
}, { collection: 'skype_message' });

var threadSchema = new Schema({
  name: String,
  uid: String
}, { collection: 'skype_thread' });

var Message = mongoose.model('Message', messageSchema);
var Thread = mongoose.model('Thread', threadSchema);
var Person = mongoose.model('Person', personSchema);

exports.saveMessage = function (msg, callback) {
  getOrCreateThread(msg, function (error, thread) {
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
        _thread: thread._id,
        _composer: person._id
      });
      console.log(message);
      return message.save(function (__error) {
        if (__error) {
          return callback(__error);
        }
        callback(null);
      });
    });
  });
};

function getOrCreateThread(msg, callback) {
  Thread.findOne({ uid: formatConversationLink(msg.resource.conversationLink) }, function (error, thread) {
    if (error) {
      return callback(error);
    }
    var sender = formatAlias(msg.resource.from);
    var name;
    if (msg.resource.threadtopic) {
      name = msg.resource.threadtopic;
    } else {
      name = sender;
    }
    if (!thread) {
      thread = new Thread({
        name: name,
        uid: formatConversationLink(msg.resource.conversationLink)
      });
      return thread.save(function (_error, _thread) {
        if (_error) {
          return callback(_error);
        }
        callback(null, _thread);
      });
    }
    if (thread.name !== name) {
      thread.name = name;
      return thread.save(function (_error, _thread) {
        if (_error) {
          return callback(_error);
        }
        callback(null, _thread);
      });
    }
    callback(null, thread);
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
