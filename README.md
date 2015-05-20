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

var output = [];

// Get TaskManager Environment By UserID
// And create task with some calculations
var task = TaskManager(userId).addTask(function(){

	this.trigger('test', {hello: 'hello world!'}); // trigger test event

	this.done();

}).settings({

	some: 'task',
	name: 'Task Example'

}).on('done', function(){

	output.push(['completed', this.get('some')]); // completed task

	output.push(['users subscribed on done', this.getSubscribers()]); // get subscribers at end

}).on('test',function(context){

	output.push([context.hello]); // hello world!

	output.push(['users subscribed at test event', this.getSubscribers()]); // get subscribers at any event

});

task.start(); // Run task

TaskManager().on('done', function(){

	console.log(output);

});

/*
[ [ 'hello world!' ],
  [ 'users subscribed at test event', [ 1, 3 ] ],
  [ 'completed', 'task' ],
  [ 'users subscribed on done', [ 1, 3 ] ] ]
*/

task.subscribe(3);
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
