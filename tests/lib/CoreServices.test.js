'use strict';

// modules
var assert = require('chai').assert,
	Promise = require('bluebird'),
	_ = require('lodash');

// core modules
var Path = require('path');

// project modules
var MicroServices = require('../../lib/MicroServices');

describe('lib/CoreService', function(){

	var TEST_SERVICE_DIR = Path.join(__dirname, '../fixtures/test-projects/project1/services/service1'),
		app,
		injector,
		coreService;

	beforeEach(function(){
		app = new MicroServices({
			root: TEST_SERVICE_DIR,
			environment: 'dev'
		});
		app.initialize();
		injector = app.services['project1.service1'].injector;

		return injector.get('CoreService')
			.then(function(coreServiceInstance){
				coreService = coreServiceInstance;
			});
	});

	it('should be able to get an instance of the CoreService class', function(){
		assert.isObject(coreService);
	});


	it('should create an instance of each messenger and pass in the corresponding messages/options', function(){
		var groupedMessages = coreService.broker.groupMessages(coreService.broker.messages);

		var stubs = stubMessengers();
		return coreService.start()
			.then(function(){
				assert(stubs.CoreHttpMessenger.start.calledOnce, 'it should call the start method on the CoreHttpMessenger class');
				assert(stubs.CoreHttpMessenger.start.calledWith(groupedMessages.CoreHttpMessenger), 'it should call the start method on the CoreHttpMessenger class');
			});
	});

	it('should start the services when calling start', function(){
		var stubs = stubMessengers();
		return coreService.start()
			.then(function(){
				assert(stubs.CoreHttpMessenger.start.callCount > 0, 'it should call the start method on the CoreHttpMessenger class');
			});
	});

	it('should stop all running messengers', function(){
		var stubs = stubMessengers();
		return coreService.start()
			.then(function(){
				return coreService.stop();
			})
			.then(function(){
				assert(stubs.CoreHttpMessenger.stop.calledOnce, 'it should call the start method on the CoreHttpMessenger class');
			});
	});

	function stubMessengers(){
		var stubs = {};
		_.each(['CoreHttpMessenger','CoreRabbitMQMessenger','CoreRpcMessenger'], function(messenger){
			var start = app.injector.stub(messenger, 'start', function(){
				return Promise.resolve();
			});
			var stop = app.injector.stub(messenger, 'stop', function(){
				return Promise.resolve();
			});
			stubs[messenger] = {
				start: start,
				stop: stop
			};
		});
		return stubs;
	}


});
