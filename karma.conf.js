var webpackConfig = require('./webpack.config');
var fs = require('fs');
module.exports = function(config) {

    if (!process.env.SAUCE_USERNAME) {
        if (!fs.existsSync('sauce.json')) {
            console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
            process.exit(1);
        } else {
            process.env.SAUCE_USERNAME = require('./sauce').username;
            process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
        }
    }

    var customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 7',
            version: '51'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            version: '45'
        },
        w7_ie8: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '8'
        },
        w7_ie9: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
        },
        w7_ie10: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '10'
        },
        w7_ie11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '11'
        },
        w10_edge: {
            base: 'SauceLabs',
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10',
            version: '13'
        },
        osX_safari: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.11',
            version: '9.0'
        }
    };

    var settings = {
        basePath: '',
        frameworks: ['jasmine'],

        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        autoWatchBatchDelay: 300,

        files: ['./tests/**/*.ts'],

        preprocessors: {
            './tests/**/*.spec.ts': ['webpack']
        },

        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        },

        webpackMiddleware: {
            noInfo: true
        },

        sauceLabs: {
            testName: 'inactivtyLog',
            connectOptions: {
                dns: '8.8.8.8'
            }
        },
        reporters: ["dots", "saucelabs"],
        specReporter: {
            maxLogLines: 5, // limit number of lines logged per test
            suppressErrorSummary: true, // do not print error summary
            suppressFailed: false, // do not print information about failed tests
            suppressPassed: false, // do not print information about passed tests
            suppressSkipped: true, // do not print information about skipped tests
            showSpecTiming: false // print the time elapsed for each spec
        }
    };

    if(process.env.SAUCELABS === 'true'){
        settings.captureTimeout = 120000;
        settings.customLaunchers = customLaunchers;
        settings.browsers = Object.keys(customLaunchers);
        settings.singleRun = true;
        settings.concurrency = 3;
    } else {
        settings.browsers = ['Chrome'];
        settings.singleRun = false;
        settings.concurrency = Infinity;
    }

    config.set(settings);
};