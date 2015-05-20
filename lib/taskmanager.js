var util = require('util');
var events = require('events');
var userEnvironments = {};

exports = module.exports = getEnvironment;

events.EventEmitter.prototype.__emit = events.EventEmitter.prototype.emit;

function SettingsDriver(){
	this.__settings = {};
	events.EventEmitter.call(this);
}

util.inherits(SettingsDriver, events.EventEmitter);

SettingsDriver.prototype.set = function(k,v) {
	this.__settings[k] = v;
};

SettingsDriver.prototype.get = function(k) {
	return this.__settings.hasOwnProperty(k)? this.__settings[k] : null;
};

SettingsDriver.prototype.emit = SettingsDriver.prototype.trigger = function(type){

	if(this._events.hasOwnProperty(type) && typeof this._events[type] === 'object' && this._events[type].constructor === Array){

		this._events[type].sort(function(x, y){

			var xg, yg;

			xg = typeof x.global === 'boolean';
			yg = typeof y.global === 'boolean';

			if(xg && !yg){
				return 1;
			}

			if(!xg && yg){
				return -1;
			}

			return 0;

		});

	}

	switch(arguments.length){
		// fast cases
		case 1:
			return this.__emit.call(this, type);
			break;
		case 2:
			return this.__emit.call(this, type, arguments[1]);
			break;
		case 3:
			return this.__emit.call(this, type, arguments[1], arguments[2]);
			break;
		case 4:
			return this.__emit.call(this, type, arguments[1], arguments[2], arguments[3]);
			break;
		// slower
		default:
			return this.__emit.apply(this, arguments.slice(1));
	}

};

function Task(e, __function){
	this._events 		= [];
	this.__index 		= -1;
	this.__env 			= e;
	this.__users 		= [];
	this.__settings 	= [];
	this.__function 	= __function;
	this.__steps 		= [];
	this.__stoped 		= false;
	this.__started 		= false;
}

util.inherits(Task, SettingsDriver);

Task.prototype.step = function(__cb){
	var cb, self, len, args, i, argsAll;

	cb = __cb || function(){};
	self = arguments[1] || this;
	len = arguments.length;
	args = arguments;

	process.nextTick(function(){
		switch (len) {
			// fast cases
			case 1:
			case 2:
				cb.call(self);
				break;
			case 3:
				cb.call(self, args[2]);
				break;
			case 4:
				cb.call(self, args[2], args[3]);
				break;
			// slower
			default:
				argsAll = new Array(len - 2);
				for (i = 2; i < len; i++)
					argsAll[i - 2] = args[i];
				cb.apply(self, argsAll);
		}
	});

	return this;
};

Task.prototype.settings = function(input) {
	var self = this;
	if(typeof input === 'function'){
		input.call(self);
	}else if(typeof input === 'object' && input.constructor !== Array){
		Object.getOwnPropertyNames(input).forEach(function(key){
			if(input.hasOwnProperty(key)){
				self.set(key, input[key]);
			}
		});
	}
	return self;
};

Task.prototype.getSubscribers = function() {
	return this.__users;
};

Task.prototype.subscribe = function(uid) {

	if(typeof uid.constructor === 'object' && uid.constructor === Array){

		for(var i = 0; i < uid.length; i++){

			if(typeof uid[i] === 'number'){

				this.subscribe(uid[i]);

			}

		}

	}else if(typeof uid === 'number' && this.__users.indexOf(uid) < 0){

		this.__users.push(uid);

	}

	return this;

};

Task.prototype.unsubscribe = function(uid){

	if(typeof uid.constructor === 'object' && uid.constructor === Array){

		for(var i = 0; i < uid.length; i++){

			if(typeof uid[i] == 'number'){

				this.unsubscribe(uid[i]);

			}

		}

	}else if(typeof uid == 'number'){

		var index = this.__users.indexOf(uid);

		if(this.__users.indexOf(uid) > -1){

			this.__users.splice(index, 1);

		}

	}

	return this;
};

Task.prototype.start = function(){

	if(this.started) return this;

	this.started = true;

	this.step(this.trigger, this, 'beforeStart', this);
	this.step(this.trigger, this, 'start', this);
	this.step(this.__function, this);
	this.step(this.trigger, this, 'afterStart', this);

	return this;
};

Task.prototype.stop = function(){

	if(this.index > -1){

		this.__env.splice(this.index, 1);

	}

	this.removed = true;

};

Task.prototype.done = function(){
	this.step(function(){
		this.trigger('done', this);
	});
};

function TaskEnvironment(uid){
	this.__tasks = [];
	this.__subscribed = [];
	this.uid = uid || 0;
}

util.inherits(TaskEnvironment, SettingsDriver);

TaskEnvironment.prototype.flush = function(){
	this.__tasks = [];
	this.__subscribed = [];

	var self = this;

	Object.getOwnPropertyNames(this._events).forEach(function(name){
		if(name === 'newListener') return;
		delete self._events[name];
	});
};

TaskEnvironment.prototype.addTask = function(__function){

	var task = new Task(this, __function);

	Object.getOwnPropertyNames(getEnvironment(0)._events).forEach(function(name){

		if(name === 'newListener') return;

		if(userEnvironments[0]._events.hasOwnProperty(name)){

			var listeners = userEnvironments[0]._events[name];

			if(typeof listeners === 'function'){

				listeners.global = true;

				task.addListener(name, listeners);

			}else if(typeof listeners === 'object' && listeners.constructor === Array){

				listeners.forEach(function(func){

					func.global = true;

					task.addListener(name, func);

				});

			}

		}

	});

	var index = this.__tasks.push(task) - 1;

	task.__index = index;

	task.subscribe(this.uid);

	this.__subscribed.push(index);

	return this.__tasks[index];

};

exports.SettingsDriver = SettingsDriver;
exports.Task = Task;
exports.TaskEnvironment = TaskEnvironment;

function getEnvironment(_uid){
	var uid = _uid || 0;

	if (!userEnvironments.hasOwnProperty(uid)) {

		userEnvironments[uid] = new TaskEnvironment(uid);

	}

	return userEnvironments[uid]
}

getEnvironment(0).addListener('newListener', function(type, listener){

	Object.getOwnPropertyNames(userEnvironments).forEach(function(__uid){

		if(__uid == 0) return;

		userEnvironments[__uid].__tasks.forEach(function(task){

			listener.global = true;

			task.addListener(type, listener);

		});

	});

});