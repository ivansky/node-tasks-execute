## Tasks Subscribe

[![NPM Version][npm-image]][npm-url][![Node Version][node-version-image]][node-url][![Build Status][travis-image]][travis-url][![Code Climate][codeclimate-image]][codeclimate-url]

Task Manager with Subscribers for [node][node-url].

## Installation

```bash
$ npm install tasks-subscribe
```

## Example
```js
var TaskManager = require('tasks-subscribe');

var userId = 1; // user id, will be subscribed at the start

// Register global event to done
TaskManager().on('done', function(){
	console.log('global completed', this.name);
});

// Get TaskManager Environment By UserID
// And create task with some calculations
TaskManager(userId).addTask(function(){

	var self = this; // save link to Task instance

	//this.trigger('test', {hello: 'hello world!'}); // trigger test event
	// OR use steps
	this.step(this.trigger, this, 'test', {hello: 'hello world!'})

	this.step(function(){

		this.subscribe(2); // subscribe new user id before done

	});

	// emulate long process work
	this.step(function(){

		setTimeout(function(){

			self.done(); // call task done

		}, 300);

	});

}).settings(function(){
	
	this.set('some', 'task');

}).settings({

	name: 'Task Example'
	
}).on('done', function(){

	console.log('completed', this.get('some')); // completed task

	console.log('users subscribed', this.getSubscribers()); // get subscribers at end

	this.stop(); // set removed task's property and remove from stack

}).on('test',function(context){

	console.log(context.hello); // hello world!

	console.log('users subscribed', this.getSubscribers()); // get subscribers at any event

}).start(); // Run task

// hello world!
// users subscribed [ 1 ]
// completed task
// users subscribed [ 1, 2 ]
// global completed Task Example
```

1. First Local Events
2. Second Global Events

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/tasks-subscribe.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tasks-subscribe
[node-url]: https://nodejs.org/
[node-version-image]: https://img.shields.io/node/v/tasks-subscribe.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/ivansky/node-tasks-subscribe/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/ivansky/node-tasks-subscribe
[codeclimate-image]: https://img.shields.io/codeclimate/github/ivansky/node-tasks-subscribe.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/ivansky/node-tasks-subscribe
