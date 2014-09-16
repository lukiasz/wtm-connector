/* global require, describe, it, console, Buffer */

// line below allow to put alone expression in line, eg. 'expect(cookieJar).to.exist;'
/* jshint -W030 */

var expect = require('chai').expect,
    fs = require('fs'),
	wtmConnector = require('../wtm-connector.js');


// in case you get a timeout: https://github.com/visionmedia/mocha/issues/1127
describe('WtmConnector', function() {
    var globalTestData = {
        server: 'http://localhost:64053',
        login: 'test_' + Date.now(),
        password: 'test_test1',
        email: 'test_' + Date.now() + '@test.com'
    };
    
    // it'll use 'server' property only
    wtmConnector.init(globalTestData);
      
    describe('register, upload, index, download, delete, upload & download, delete', function() {
        var testData = globalTestData;
        var contentId = -1;
        it('should list files and then download file properly', function(done) {
            this.timeout(60000);
            var fileName = 'sample.srt';
            // register
            wtmConnector.account.register(testData.login, testData.password, testData.email)
            .then(function(result) {
                //expect(result.body.User).to.equal(testData.login);
                //expect(result.body.Email).to.equal(testData.email);
                
				// login
                return wtmConnector.account.login(testData.login, testData.password);
            })
            .then(function(result) {
                //expect(result.body.User).to.equal(testData.login);
                //expect(result.body.Email).to.equal(testData.email);
                
                // upload
                var fileBinaryData = fs.readFileSync(fileName);
                var fileBase64Data = new Buffer(fileBinaryData).toString('base64');
                return wtmConnector.content.upload(fileName, fileBase64Data);
            })
            .then(function(result) {
                //expect(result.body).to.be.not.null;
                
                // download
                contentId = result.body.Id;
                return wtmConnector.content.get(result.body.Id, true, true);
            })
            .then(function(result) {
                //expect(result.body).to.be.not.empty;
                return wtmConnector.content.remove(contentId);
            })
            .then(function(result) {
                done();
            });
            
        });
        
    });
});
