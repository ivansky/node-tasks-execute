var assert = require('assert'),
	TaskManager = require(__dirname+'/../');

// Node Describe do not work here
// @todo Async Testing

var testOKResult = [
	['hello world!'],
	['users subscribed', [ 1 ]],
	['completed', 'task'],
	['users subscribed', [ 1, 2 ]],
	['global completed', 'Task Example']
];

var testOKResultGlobals = [
	['global completed', '1'],
	['completed', 'self'],
	['global completed', '2']
];

describe("Generic main tests", function() {

	it("Global events", function(){

		TaskManager().on('done', function(){

			this.a++;

			assert.strictEqual(3, this.a);

		});

		TaskManager(1).addTask(function(){

			this.done();

		}).settings(function(){

			this.a = 1;

		}).on('done', function(){

			this.a++;

		}).start();

	});

	it("Set Settings as Object", function(){

		TaskManager(2).addTask(function(){

			this.__settings.a++;

			this.done();

		}).settings({a: 2}).on('done', function(){

			assert.strictEqual(3, this.get('a'));

		}).start();

	});

	it("Collection output correct values and sorting", function() {

		var userId = 1; // user id, will be subscribed at the start

		var output = [];

		TaskManager().on('done', function(){

			output.push(['global completed', this.name]);

			assert.strictEqual(testOKResult, output);

		});

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

			this.name = 'Task Example';

		}).on('done', function(){

			output.push(['completed', this.some]); // completed task

			output.push(['users subscribed', this.getSubscribers()]); // get subscribers at end

			this.remove(); // set removed task's property and remove from stack

		}).on('test',function(context){

			output.push([context.hello]); // hello world!

			output.push(['users subscribed', this.getSubscribers()]); // get subscribers at any event

		}).start(); // Run task

	});

	it("Additions Global Events", function(){
		var userId = 1;
		var output = [];

		TaskManager(0).on('done', function(){
			output.push(['global completed', '1']);
		});

		TaskManager(userId).addTask(function(){
			var self = this;

			this.step(function(){
				self.done();
			});

		}).on('done', function(){

			output.push(['completed', 'self']);

			assert.deepEqual(testOKResultGlobals, output);

		}).start();

		TaskManager(0).on('done', function(){
			output.push(['global completed', '2']);
		});

	});

});

