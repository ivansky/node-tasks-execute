## Tasks Subscribe

[![NPM Version][npm-image]][npm-url]

Task Manager with Subscribers for [node](http://nodejs.org).


```js
var TaskManager = require('tasks-subscribe');

var userId = 1;
 
// Get TaskManager Environment By UserID
// And create task with some calculations
TaskManager(userId).addTask(function(){

	var self = this; // save link to Task instance

	this.trigger('test', {hello: 'hello world!'}); // trigger test event

	self.done(); // call task done

}).settings(function(){

	this.some = 'var';

}).on('done', function(){

	console.log('completed', this.some); // completed var

	this.remove(); // set removed task's property and remove from stack

}).on('test',function(context){

	console.log(context.hello); // hello world!

}).start(); // Run task

// hello world!
// completed var
```

## Installation

```bash
$ npm install tasks-subscribe
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/tasks-subscribe.svg
[npm-url]: https://npmjs.org/package/tasks-subscribe