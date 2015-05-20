var assert = require('assert'),
	TaskManager = require(__dirname+'/../');

var testOKResult = [
	[ 'hello world!' ],
	[ 'users subscribed', [ 1, 2 ] ],
	[ 'completed', 'task' ],
	[ 'users subscribed', [ 1, 2 ] ],
	[ 'global completed', 'Task Example' ]
];


var testOKResultGlobals = [
	['completed', 'self'],
	['global completed', '1'],
	['global completed', '2']
];

describe("Generic main tests", function() {

	this.timeout(800);

	it('Start Events Test', function(done){
		assert.doesNotThrow(function(){

			var outputOk = ['beforeStart', 'start', 'afterStart'];

			var output = [];

			TaskManager(0).flush();

			TaskManager(0).on('done',function(){
				assert.deepEqual(output, outputOk);
				done();
			});

			TaskManager().addTask(function(){
				this.step(this.done);
			}).on('beforeStart', function(){
				output.push('beforeStart');
			}).on('start', function(){
				output.push('start');
			}).on('afterStart', function(){
				output.push('afterStart');
			}).start();

		})
	});

	it("Steps with events", function(done){
		assert.doesNotThrow(function() {

			var output = [];

			TaskManager(0).flush();

			TaskManager(0).on('done', function(){
				output.push(8);
				assert.deepEqual([1,2,3,4,5,6,7,8], output);
				done();
			});

			TaskManager(3).addTask(function(){
				this.step(function(){
					output.push(1);
				});
				this.step(function(){
					output.push(2);
				});
				this.step(function(){
					output.push(3);
				});
				this.step(function(){
					this.trigger('test');
				});
				this.step(function(){
					output.push(5);
				});
				this.step(function(){
					output.push(6);
				});

				this.done();

			}).on('test', function(){

				output.push(4);

			}).on('done', function(){

				output.push(7);

			}).start();

		});
	});

	it("Global events", function(done){

		assert.doesNotThrow(function() {

			setTimeout(function(){

				TaskManager(0).flush();

				// Register first global done event
				TaskManager().on('done', function(){

					this.__settings.a++; // Increment option a

				});

				// Create task and start it immediately
				TaskManager(1).addTask(function(){

					this.done(); // Call done event

				}).settings({

					a: 1 // Set variables as object or function with sync calculations

				}).on('done', function(){

					this.__settings.a++; // Executed before all global events with name `done`

				}).start();

				// Register second global done event after start task
				TaskManager().on('done', function(){

					assert.strictEqual(3, this.get('a'));

					done();

				});

			}, 0);

		});

	});

	it("Set Settings as Object", function(done){

		assert.doesNotThrow(function() {

			setTimeout(function(){

				TaskManager(0).flush();

				TaskManager(2).addTask(function(){

					this.__settings['a']++;

					this.done();

				}).settings({a: 2}).on('done', function(){

					assert.strictEqual(3, this.get('a'));

					done();

				}).start();

			}, 0);

		});

	});

	it("Collection output correct values and sorting", function(done) {

		assert.doesNotThrow(function() {

			setTimeout(function(){

				TaskManager(0).flush();

				var userId = 1; // user id, will be subscribed at the start

				var output = [];

				TaskManager().on('done', function(){

					output.push(['global completed', this.get('name')]);

				});

				// Get TaskManager Environment By UserID
				// And create task with some calculations
				TaskManager(userId).addTask(function(){

					var self = this; // save link to Task instance

					this.step(function(){
						this.trigger('test', {hello: 'hello world!'}); // trigger test event
					});

					this.step(function() {

						// emulate long process work
						setTimeout(function () {

							self.done(); // call task done

						}, 40);

					});

					this.step(function(){

						this.subscribe(2); // subscribe new user id before done

					});

				}).settings({
					some: 'task',
					name: 'Task Example'
				}).on('done', function(){

					output.push(['completed', this.get('some')]); // completed task

					output.push(['users subscribed', this.getSubscribers()]); // get subscribers at end

					//this.stop(); @todo Release Stop method

				}).on('test',function(context){

					output.push([context.hello]); // hello world!

					output.push(['users subscribed', this.getSubscribers()]); // get subscribers at any event

				}).start(); // Run task

				TaskManager().on('done', function(){

					assert.deepEqual(testOKResult, output);

					done();

				});

			}, 0);

		});

	});

	it("Additions Global Events", function(done){

		assert.doesNotThrow(function() {

			setTimeout(function(){

				TaskManager(0).flush();

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

				}).start();

				TaskManager(0).on('done', function(){
					output.push(['global completed', '2']);
				});

				TaskManager(0).on('done', function(){

					assert.deepEqual(testOKResultGlobals, output);

					done();

				});

			}, 0);

		});

	});

});

