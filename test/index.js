/* global require, describe, it, console, Buffer */

// line below allow to put alone expression in line, eg. 'expect(cookieJar).to.exist;'
/* jshint -W030 */

var expect = require('chai').expect,
    fs = require('fs'),
	wtmConnector = require('../wtm-connector.js');


describe('WTM Connector', function() {
    var accountData = {
        login: 'test_' + Date.now(),
        password: 'test_test1',
        email: 'test_' + Date.now() + '@test.com'
    };
    
    var fileData = {
        // this change after upload
        id: -1
    };
    
    
    describe('Utilities', function() {
        it('Should encrypt user password with sha-1 algorithm', function() {
            var plainTextPassword = 'password';
            var sha1EncryptedPassword = '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8';
            var wtmEncryptedPassword = wtmConnector.getEncryptedPassword(plainTextPassword);
            expect(wtmEncryptedPassword).to.equal(sha1EncryptedPassword);
        });
        
        describe('testInternetConnection', function() {
            it('Should get content from google.com', function(done) {
            	wtmConnector.testInternetConnection().then(function(result) {
                    expect(result).to.be.not.empty;
                    done();
                }).fail(function(error) {
                    done('It not works: ' + error);
                });
        	});  
		});
        
        
    });
      
    describe('API used in Popcorn Integration', function() {
        this.timeout(60000);
        
        
        
        
        it('Should invoke error handler when response has error code >= 400', function(done) {
            wtmConnector.content.remove({
                id: -1
            }).then(function(result) {
                done('Error handler not invoked');
            }).fail(function(error) {
                done();
            });
        });
        
        it('Should register a new user', function(done) {
            try {
            wtmConnector.account.register(accountData).then(function(result) {
                
                	// Mocha doesn't properly handle exceptions in
                    // asynchronous calls - that's why try/catch are
                    // everywhere.
                	// http://stackoverflow.com/questions/16607039/in-mocha-testing-while-calling-asynchronous-function-how-to-avoid-the-timeout-er
                try {
                    expect(result.User).to.equal(accountData.login);
                	expect(result.Email).to.equal(accountData.email);
					done();
                } catch (error) {
                    done(error);
                }
            }).fail(function(error) {
               done(error);
            });
            } catch (e) {
             done(e);   
                
            }
        });
        
        it('Should login an existing user', function(done) {
            wtmConnector.account.login(accountData).then(function(result) {
                try {
                    expect(result.User).to.equal(accountData.login);
                	expect(result.Email).to.equal(accountData.email);
					done();
                } catch (error) {
                    done(error);
                }
            }).fail(function(error) {
               done(error);
            });
        });
        
        it('Should send Base 64 encoded file', function(done) {
            var existingFileName = 'sample.srt';

            // Change that if you want file to be
            // parsed every time on server.
            var fileNameSentToServer = 'sample.srt';
            var fileBinaryData = fs.readFileSync(existingFileName);
            var fileBase64Data = new Buffer(fileBinaryData).toString('base64');
            
            wtmConnector.content.upload({
                name: fileNameSentToServer,
                base64Content: fileBase64Data
            }).then(function(result) {
                try {
                    expect(result.Id).to.be.above(0);
                    fileData.id = result.Id;
					done();
                } catch (error) {
                    done(error);
                }
            }).fail(function(error) {
               done(error);
            });
        });
        
        it('Should receive previously uploaded file', function(done) {
            wtmConnector.content.get({
                id: fileData.id,
                removeKnownDialogs: true,
                srtOutput: true
            }).then(function(result) {
                try {
                    expect(result).to.be.not.empty;
					done();
                } catch (error) {
                    done(error);
                }
            }).fail(function(error) {
               done(error);
            });
        });
        
        it('Should receive an exception with contentId after trying to upload same file again', function(done) {
            var existingFileName = 'sample.srt';


            var fileNameSentToServer = 'sample.srt';
            var fileBinaryData = fs.readFileSync(existingFileName);
            var fileBase64Data = new Buffer(fileBinaryData).toString('base64');
            
            wtmConnector.content.upload({
                name: fileNameSentToServer,
                base64Content: fileBase64Data
            }).then(function(result) {
                done('Exception not received');
            }).fail(function(error) {
                expect(error.body).to.be.not.empty;
                var body = JSON.parse(error.body);
                expect(body.Data.errorCode).to.be.not.empty;
                expect(body.Data.contentId).to.be.above(0);
               done();
            });
        });
        
        it('Should remove previously uploaded file', function(done) {
            wtmConnector.content.remove({
                id: fileData.id
            }).then(function(result) {
                try {
                    expect(result).to.equal('ok');
					done();
                } catch (error) {
                    done(error);
                }
            }).fail(function(error) {
               done(error);
            });
        });
        
        it('Should invoke error handler when server does not respond', function(done) {
            wtmConnector.init({
                server: 'http://waytomaster-invalid.com'
            });
            
            wtmConnector.account.logoff().then(function(result) {
                wtmConnector.init({
                	server: 'http://waytomaster.com'
            	});
                done('Error handler not invoked');
            }).fail(function(error) {
                wtmConnector.init({
                	server: 'http://waytomaster.com'
            	});
               	done();
            });
        });
        
    });
});
