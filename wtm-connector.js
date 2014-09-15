/* global require, module */
var unirest = require('unirest'),
    q = require('q');

var wtmConnector = function() {

    var config = { };

    var init = function(options) {
        config.server = options.server || 'http://waytomaster.com';
        config.cookieJar = options.cookieJar || unirest.jar();
    };

    // Account
    
    var login = function(login, password) {
        var path = '/Account/Login';
        var data = {
            Name: login,
            Password: password,
            RememberMe: true
        };
        return post(path, data, initCookieJar);
    };

    var register = function(login, password, email) {
        var path = '/Account/Register';
        var data = {
            Name: login,
            Password: password,
            Email: email
        };
        return post(path, data, initCookieJar);
    };
    
    var getUserData = function() {
        return get('/Account/GetUserData');
    };
    
    var logoff = function() {
        return get('/Account/LogOff');
    };
    
    var isAuthenticated = function() {
        return get('/Account/IsAuthenticated');
    };
    
    // Content
    
    var index = function() {
        return get('/Content/Index');
    };
    
    var details = function(id) {
        return get('/Content/Details?id=' + id);
    };
    
    var getFile = function(id, removeKnownDialogs, srtOutput) {
        var options = 'None';
        if (removeKnownDialogs === true) {
            options += ',RemoveKnownDialogs';
        }
        if (srtOutput === true) {
            options += ',SrtOutput';
        }
        return get('/Content/Get?id=' + id + '&options=' + options);
    };
    
    var uploadFile = function(filePath) {
        var path = '/Content/New';
        var data = 'notUsedHashcode';
        return post(path, data, null, null, filePath);
    };
    
    // Helpers methods
    
    var get = function(pathWithParams, success, error) {
        var deferred = q.defer();
        unirest.get(config.server + pathWithParams).jar(config.cookieJar).end(
            function(response) {
                if (response.error) {
                    if (typeof error == typeof Function) {
                        error(response.error);
                    }
                    deferred.reject(response.error);
                } else {
                    if (typeof success == typeof Function) {
                        success(response);
                    }
                    deferred.resolve(response);
                }
            });
        return deferred.promise;
    };
    
    var post = function(path, data, success, error, filePath) {
        var deferred = q.defer();
        var call = unirest.post(config.server + path).send(data);
        if (filePath) {
            call.attach('file', filePath);
        }
        
        call.jar(config.cookieJar).end(
            function(response) {
                if (response.error) {
                    if (typeof error == typeof Function) {
                        error(response.error);
                    }
                    deferred.reject(response.error);
                } else {
                    if (typeof success == typeof Function) {
                        success(response);
                    }
                    deferred.resolve(response);
                }
            });
        return deferred.promise;
    };
    
    var initCookieJar = function(response) {
        config.cookieJar = unirest.jar();
        var authCookie = unirest.cookie('.ASPXAUTH=' +
                                        response.cookies['.ASPXAUTH']);
        config.cookieJar.add(authCookie, config.server);
    };
    
    return {
        init: init,
        config: config,
        account: {
            login: login,
        	getUserData: getUserData,
            register: register,
            isAuthenticated: isAuthenticated
        },
        content: {
            index: index,
            details: details,
            get: getFile,
            new: uploadFile
        }
    };
};

module.exports = new wtmConnector();
