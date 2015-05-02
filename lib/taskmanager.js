var TaskManagerInstance;

function TaskManagerPackage(){

	var instance = {};
	var tasks = [];

	function TaskEnvirovment(uid){

		function Task(__function){

			var events = {};

			var users = [];

			this.index = -1;

			this.name = '';

			this.removed = false;

			this.getSubscribers = function(){

				return users;

			};

			this.remove = function(){

				if(this.index > -1){

					tasks.splice(this.index, 1);

				}

				this.removed = true;

			};

			this.settings = function(__c){

				var c = __c || function(){};

				c.call(this);

				return this;

			};

			this.subscribe = function(uid){

				var self = this;

				if(uid.constructor === Array){

					for(var i = 0; i < uid.length; i++){

						if(typeof uid[i] == 'number'){

							self.subscribe(uid[i]);

						}

					}

				}else if(typeof uid == 'number' && users.indexOf(uid) < 0){

					users.push(uid);

				}

				return this;

			};

			this.unsubscribe = function(uid){

				var self = this;

				if(uid.constructor === Array){

					for(var i = 0; i < uid.length; i++){

						if(typeof uid[i] == 'number'){

							self.unsubscribe(uid[i]);

						}

					}

				}else if(typeof uid == 'number'){

					var index = users.indexOf(uid);

					if(users.indexOf(uid) > -1){

						users.splice(index, 1);

					}

				}

				return this;
				
			};

			this.done = function(){
				this.trigger('done');
			};

			this.trigger = function(name, __context){

				var self = this;

				var context = __context || {};

				if(events.hasOwnProperty(name)){

					events[name].forEach(function(c){

						c.call(self, context);

					});

				}

				return this;
			};

			this.on = function(name, __c){
				var c = __c || function(){};

				if(!events.hasOwnProperty(name)){
					events[name] = [];
				}

				if(typeof c == 'function'){
					events[name].push(c);
				}

				return this;
			};

			this.start = function(){
				__function.call(this);
			};

		}

		this.uid = uid;

		this.count = 0;

		this.taskIdSubscribes = [];

		this.addTask = function(__function){

			var task = new Task(__function);

			var l = task.push(task);

			var index = l - 1;

			task.index = index;

			tasks.subscribe(this.uid);

			this.taskIdSubscribes.push(index);

			return tasks[index];

		}

	}

	return function(uid){

		if(!instance.hasOwnProperty(uid)){
			instance[uid] = new TaskEnvirovment(uid);
		}

		return instance[uid];

	};

};

module.exports = TaskManagerInstance? TaskManagerInstance : TaskManagerInstance = TaskManagerPackage();