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
            },
            "getFormDataInput" : {
                //0 idle, 1 pending
                "state" : 0,
                "processVariableName" : "",
                "out" : ""
            },
            "getNextTasksInfo" : {
                //0 idle, 1 pending
                state : 0,
                out : [{ "url" : "dfsdfsdf" }]
            },
        };

        var myReturn = {
            getUserName: getUserName,
            userName : contextFactory.getUserName.out,
            getFormDataInput : getFormDataInput,
            getNextTasksInfo : getNextTasksInfo
        };

        init();

        return myReturn;

        function init() {
            try {
                $log.log('init: start');
            }catch(err){
                $log.error('init: ' + err);
            }
        }

        /**
         1 - For int process varialble
         import com.fasterxml.jackson.core.JsonProcessingException;
         import com.fasterxml.jackson.databind.ObjectMapper;

         Map<String,String> map = new HashMap<String,String>();
         map.put("key1","value1");
         map.put("key2","value2");

         String mapAsJson = null;
         try {
          	mapAsJson = new ObjectMapper().writeValueAsString(map);
          } catch (JsonProcessingException e) {
          	e.printStackTrace();
          }
         return mapAsJson;
         2 - For the UiDesginer
         Create a variable with the implementation return customService.getFormDataInput('formDataInput',$data.taskId);
         */
        function getFormDataInput(processVariableName, taskId){
            try {
                $log.log('getFormDataInput: start (processVariableName:{0}, taskId:{1})', processVariableName, taskId);
                if((processVariableName !== "")&&(taskId !== 0)){
                    if((processVariableName !== contextFactory.getFormDataInput.processVariableName)&&(contextFactory.getFormDataInput.state === 0)){
                        contextFactory.getFormDataInput.processVariableName = processVariableName;
                        contextFactory.getFormDataInput.state = 1;
                        $http({
                            method: 'GET',
                            url: "../API/bpm/task/"+taskId
                        }).then(function successCallback(response) {
                            var caseId = response.data.caseId;
                            if(!angular.isUndefined(caseId)){
                                $http({
                                    method: 'GET',
                                    url: "../API/bpm/caseVariable/"+caseId+"/"+encodeURI(processVariableName)
                                }).then(function successCallback(response) {
                                    contextFactory.getFormDataInput.state = 0;
                                    var responseJson = JSON.parse(response.data.value);
                                    contextFactory.getFormDataInput.out = responseJson;
                                }, function errorCallback(response) {
                                    $log.error(response);
                                    contextFactory.getFormDataInput.state = 0;
                                });
                            }else{
                                $log.error(response);
                                contextFactory.getFormDataInput.state = 0;
                            }
                        }, function errorCallback(response) {
                            $log.error(response);
                            contextFactory.getFormDataInput.state = 0;
                        });
                    }
                }else{
                    $log.error('customService.getFormDataInput : processVariableName is empty or taskId is empty');
                }

                return contextFactory.getFormDataInput.out;
            }catch(err){
                $log.error('getFormDataInput: ' + err);
            }
        }

        /**
         *
         * @param userId
         * @returns {*}
         */
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

        /**
         * @param caseId
         * TODO : filtrer sur le user, pb d'autoaffectation
         */
        function getNextTasksInfo(caseId){
            try {
                $log.log('getNextTasksInfo: start', caseId);
                if(caseId !== ""){
                    if((caseId !== contextFactory.getNextTasksInfo.caseId)&&(contextFactory.getNextTasksInfo.state === 0)){
                        contextFactory.getNextTasksInfo.caseId = caseId;
                        contextFactory.getNextTasksInfo.state = 1;
                        $http({
                            method: 'GET',
                            url: "../API/bpm/humanTask?p=0&c=10"
                        }).then(function successCallback(response) {
                            for(var indice in response.data){
                                contextFactory.getNextTasksInfo.out = [];
                                if((parseInt(response.data[indice].parentCaseId) === caseId)&&(response.data[indice].state === 'ready')){
                                    var objReturn = [{
                                        "id" : response.data[indice].id,
                                        "name" : response.data[indice].name,
                                        "displayName" : response.data[indice].displayName
                                    }];
                                    contextFactory.getNextTasksInfo.out = objReturn;
                                    break;
                                }
                            }
                            contextFactory.getNextTasksInfo.state = 0;
                        }, function errorCallback(response) {
                            $log.error(response);
                            contextFactory.getNextTasksInfo.state = 0;
                        });
                    }
                }else{
                    $log.error('customService.getNextTasksInfo : caseId is empty');
                }

                return contextFactory.getNextTasksInfo.out;
            }catch(err){
                $log.error('getNextTasksInfo: ' + err);
            }
        }
    }

    angular.module('bonitasoft.ui.extensions')
        .service('customService', customService)
        .run(function ($injector) {
            global.customService = $injector.get('customService');
        });
})(this);