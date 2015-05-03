## Tasks Subscribe

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-version-image]][node-url]

Task Manager with Subscribers for [node](http://nodejs.org).

## Installation

```bash
$ npm install tasks-subscribe
```

## Example
```js
var TaskManager = require('tasks-subscribe');

var userId = 1; // user id, will be subscribed at the start

// Get TaskManager Environment By UserID
// And create task with some calculations
TaskManager(userId).addTask(function(){

	var self = this; // save link to Task instance

	this.trigger('test', {hello: 'hello world!'}); // trigger test event

	// emulate long process work
	setTimeout(function(){

		self.done(); // call task done

	}, 3000);

	this.subscribe(2); // subscribe new user id before done

}).settings(function(){

	this.some = 'task';

}).on('done', function(){

	console.log('completed', this.some); // completed task

	console.log('users subscribed', this.getSubscribers()); // get subscribers at end

	this.remove(); // set removed task's property and remove from stack

}).on('test',function(context){

	console.log(context.hello); // hello world!

	console.log('users subscribed', this.getSubscribers()); // get subscribers at any event

}).start(); // Run task

// hello world!
// users subscribed [ 1 ]
// completed task
// users subscribed [ 1, 2 ]
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/tasks-subscribe.svg
[npm-url]: https://npmjs.org/package/tasks-subscribe
[node-url]: https://nodejs.org/
[node-version-image]: https://img.shields.io/node/v/tasks-subscribe.svg
