(function (global) {
    'use strict';

    function customService($interpolate, $http, $log, $location, $q) {
        return {
            sayHello: sayHello,
            getInput: getInput
        };

        function sayHello(who) {
          try {
            $log.log('sayHello: start');
            return "Hello : " + who;
          }catch(err){
              $log.error('sayHello: ' + err);
          }
        }

        function getName(userId) {
          try {
            $log.log('getInput: start');
            return asyncGreet(userId);
            promise.then(function(greeting) {
              $log.log('Success: ' + greeting);
            }, function(reason) {
              $log.log('Failed: ' + reason);
            });
          }catch(err){
              $log.error('getInput: ' + err);
          }
        }

        function asyncGreet(userId) {
          // perform some asynchronous operation, resolve or reject the promise when appropriate.
          return $q(function(resolve, reject) {
            $http({
              method: 'GET',
              url: "../API/identity/user/"+userId
            }).then(function successCallback(response) {
                resolve('Hello, ' + response.userName + '!');
            }, function errorCallback(response) {
              reject('Error ' + userId + ' is not allowed ('+response+')');
            });
          });
        }
    }

    angular.module('bonitasoft.ui.extensions')
      .service('customService', customService)
      .run(function ($injector) {
          global.customService = $injector.get('customService');
      });
})(this);
