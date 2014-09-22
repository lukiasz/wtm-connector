/* global require, module */
var request = require('request'),
    q = require('q'),
    sha1 = require('sha-1');

var wtmConnector = function() {

    var config = {
    	server: 'http://92.222.221.195:80'
    };
    
    var init = function(params) {
        params = params || {};
        config.server = params.server || config.server;
    };

    // Account
    var login = function(params) {
        var path = '/Account/Login';
        var encryptedPassword = params.sha1EncryptedPassword ||
            getEncryptedPassword(params.password);
        
        var data = {
            Name: params.login,
            Password: encryptedPassword,
            RememberMe: true
        };
        return post({
            path: path,
            data: data
        });
    };
    
    var getEncryptedPassword = function(password) {
        return sha1(password);
    };
    
    var testInternetConnection = function() {
        return get({
            path: '',
            server: 'http://google.com',
            JSONNotParse: true
        });
        
    };

    var register = function(params) {
        var path = '/Account/Register';
        var encryptedPassword = params.sha1EncryptedPassword ||
            sha1(params.password);
        var data = {
            Name: params.login,
            Password: encryptedPassword,
            Email: params.email
        };
        return post({
            path: path,
            data: data
        });
    };
    
    var getUserData = function() {
        return get({
            path: '/Account/GetUserData'
        });
    };
    
    var logoff = function() {
        return get({
            path: '/Account/LogOff'
        });
    };
    
    var isAuthenticated = function() {
        return get({
            path: '/Account/IsAuthenticated'
        });
    };
    
    // Content
    
    var index = function() {
        return get({
            path: '/Content/Index'
        });
    };
    
    var details = function(params) {
        return get({
            path: '/Content/Details?id=' + params.id
        });
    };
    
    var remove = function(params) {
        var data = {
            id: params.id
        };
        return post({
            path: '/Content/Remove',
            data: data
        });
    };
    
    var getFile = function(params) {
        var subsModificators = 'None';
        if (params.removeKnownDialogs === true) {
            subsModificators += ',RemoveKnownDialogs';
        }
        if (params.srtOutput === true) {
            subsModificators += ',SrtOutput';
        }
        return get({
            path: '/Content/Get?id=' + params.id + '&options=' + subsModificators,
            JSONNotParse: true
        });
    };
    
    var uploadFile = function(params) {
        var path = '/Content/UploadJson';
        var data = {
            Hashcode: 'notUsedHashcode',
            Base64Content: params.base64Content,
            Name: params.name
        };
        return post({
            path: path,
            data: data
        });
    };
    
   
    
    // Helpers methods
    var get = function(params) {
        var deferred = q.defer();
        var server = params.server || config.server;
        var r = request({
            method: 'GET',
            gzip: true,
            uri: server + params.path,
            jar: true,
            headers: {
                Host: 'waytomaster.com'
            }
        }, standardCallback(deferred, params));
        
        return deferred.promise;
    };
    
    var post = function(params) {
        var deferred = q.defer();
        var server = params.server || config.server;
        var r = request({
            method: 'POST',
            gzip: true,
            uri: server + params.path,
            form: params.data,
            jar: true,
            headers: {
                Host: 'waytomaster.com'
            }
        }, standardCallback(deferred, params));
        return deferred.promise;
    };
    
    var standardCallback = function(deferred, params) {
        return function(error, response, body) {
            if (error || response.statusCode >= 400) {
                error = error || response;
               	if (typeof params.errorCallback == typeof Function) {
                   	params.errorCallback(error);
               	}
                deferred.reject(error);
            } else {
                if (typeof params.successCallback == typeof Function) {
                    params.successCallback(JSON.parse(body));
                }
                if (params.JSONNotParse) {
                    deferred.resolve(body);
                } else {
                	deferred.resolve(JSON.parse(body));
                }
            }
        };
    };
    
    return {
        init: init,
        config: config,
        getEncryptedPassword: getEncryptedPassword,
        testInternetConnection: testInternetConnection,
        account: {
            login: login,
        	getUserData: getUserData,
            register: register,
            isAuthenticated: isAuthenticated,
            logoff: logoff
        },
        content: {
            index: index,
            details: details,
            get: getFile,
            upload: uploadFile,
            remove: remove
        }
    };
};

module.exports = new wtmConnector();
