/* global require, describe, it, console */

// line below allow to put alone expression in line, eg. 'expect(cookieJar).to.exist;'
/* jshint -W030 */

var expect = require('chai').expect;
var wtmConnector = require('../wtm-connector.js');


// in case you get a timeout: https://github.com/visionmedia/mocha/issues/1127
describe('WtmConnector', function() {
    var globalTestData = {
        server: 'http://localhost:64053',
        login: 'mister',
        password: 'mister1'
    };
    
    // it'll use 'server' property only
    wtmConnector.init(globalTestData);
    
    describe('login', function() {
        var testData = globalTestData;
        it('should log in and save cookie when credentials are valid', function(done) {
            this.timeout(10000);
            wtmConnector.account.login(testData.login, testData.password).then(function(response) {
                var cookieJar = wtmConnector.config.cookieJar;
                var server = wtmConnector.config.server;
                expect(server).to.be.a('string');
                expect(server).to.equal(testData.server);
                expect(cookieJar).to.exist;
                var cookie = cookieJar.getCookieString(server);
                expect(cookie).to.be.not.empty;
                //expect(cookie).to.be.empty;
                done();
            });
        });
        
        it('should throw unauthorized when credentials are not valid', function(done) {
            this.timeout(10000);
            wtmConnector.account.login(testData.login + 'xxx', testData.password).fail(function(error) {
                expect(error.status).to.equal(400);
                done();
            });
    	});
	});
});
