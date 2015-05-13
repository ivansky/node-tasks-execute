'use strict';

var util = require('util');
var events = require('events');

events.EventEmitter.prototype.trigger = events.EventEmitter.prototype.emit;

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

	this.trigger('beforeStart', this);

	this.trigger('start', this);

	this.__function.call(this);

	this.trigger('afterStart', this);

	return this;
};

Task.prototype.stop = function(){

	if(this.index > -1){

		this.__env.splice(this.index, 1);

	}

	this.removed = true;

};

Task.prototype.done = function(){
	this.trigger('done', this);
};

function TaskEnvironment(uid){
	this.__tasks = [];
	this.__subscribed = [];
	this.uid = uid || 0;
}

util.inherits(TaskEnvironment, SettingsDriver);

TaskEnvironment.prototype.addTask = function(__function){

	var task = new Task(this, __function);

	var env = this;

	Object.getOwnPropertyNames(env._events).forEach(function(name, k){
		if(!task._events.hasOwnProperty(name)){
			task._events[name] = [];
		}

		if(typeof env._events[name] === 'function'){
			env._events[name] = [env._events[name]];
		}

		env._events[name].forEach(function(event){
			if(typeof event === 'function'){
				task._events[name].push(event);
			}
		});
	});

	var index = this.__tasks.push(task) - 1;

	task.__index = index;

	task.subscribe(this.uid);

	this.__subscribed.push(index);

	return this.__tasks[index];

};

var userEnvironments = {};

function TaskDispatcher(){
	this.SettingsDriver = SettingsDriver;
	this.Task = Task;
	this.TaskEnvironment = TaskEnvironment;
}

TaskDispatcher.prototype.getEnv = TaskDispatcher.prototype.getEnvironment = function(uid) {

	if (!userEnvironments.hasOwnProperty(uid)) {

		userEnvironments[uid] = new TaskEnvironment(uid);

		userEnvironments[uid].addListener('newListener', function(type, listener){

			userEnvironments[uid].__tasks.forEach(function(task){

				if(typeof task._events[type] === 'function'){
					task._events[type] = [task._events[type], listener];
				}else if(typeof task._events[type] === 'object' && task._events[type].constructor === Array){
					task._events[type].push(listener);
				}else{
					task._events[type] = [listener];
				}

			});

			if(uid === 0){

				Object.getOwnPropertyNames(userEnvironments).forEach(function(__uid){

					if(__uid === 0) return;

					userEnvironments[__uid].addListener(type, listener);

				});

			}

		});

	}

	return userEnvironments[uid]
};

var taskDispatcherInstance;

module.exports = (function(){

	if(taskDispatcherInstance){
		return taskDispatcherInstance;
	}

	return taskDispatcherInstance = new TaskDispatcher();

})();