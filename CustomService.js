(function (global) {
    'use strict';

    /**
    In the ui desginer
      1)use attribut init
        a variable : "customService" with implementation "return customService;"
        and call "{{ customService.enrico }}"
      2)use methode async
        a variable : "user" with implementation "return customService.getUserName($data.userId);"
    */
    function customService($interpolate, $http, $log, $location, $q) {

        var contextFactory = {
          "getUserName" : {
            //0 idle, 1 pending
            state : 0,
            out : { "id" : 0 }
          }
        };

        var myReturn = {
            getUserName: getUserName,
            userName : contextFactory.getUserName.out
        };

        init();

        return myReturn;

        function init() {
          try {
            $log.log('init: start');
            getUserName(4);
          }catch(err){
              $log.error('init: ' + err);
          }
        }

        function getUserName(userId){
          try {
            $log.log('getUserName: start', userId);
            if(userId !== ""){
              if((userId !== contextFactory.getUserName.out.id)&&(contextFactory.getUserName.state === 0)){
                contextFactory.getUserName.state = 1;
                $http({
                  method: 'GET',
                  url: "../API/identity/user/"+userId
                }).then(function successCallback(response) {
                    $log.log(response);
                    contextFactory.getUserName.state = 0;
                    contextFactory.getUserName.out = response.data;
                    myReturn.userName = contextFactory.getUserName.out;
                }, function errorCallback(response) {
                    $log.error(response);
                    contextFactory.getUserName.state = 0;
                });
              }
            }else{
              $log.error('customService.getUserName : userId is empty');
            }

            return myReturn.userName;
          }catch(err){
              $log.error('getUserName: ' + err);
          }
        }
    }

    angular.module('bonitasoft.ui.extensions')
      .service('customService', customService)
      .run(function ($injector) {
          global.customService = $injector.get('customService');
      });
})(this);
