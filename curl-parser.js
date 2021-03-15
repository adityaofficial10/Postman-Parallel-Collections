/* eslint-disable no-useless-concat */
/* eslint-disable no-implicit-globals */
var requestConverter = require('curl-to-postmanv2');
var _ = require('lodash');

// eslint-disable-next-line object-shorthand
let curlParser = {

    getCurlOptionsFromCommander: function (options) {
        let curlOptions = ['method', 'H', 'data', 'dataType', 'form', 'query', 'F'],
            parsedOptions = {};

        _.forOwn(options, function (value, key) {
            if (_.includes(curlOptions, key)) {
                parsedOptions[key] = value;
            }
        });

        return parsedOptions;
    },

    getRequestFromCurlConfiguration: function (curlCommand) {
        let requestConfig;

        if (_.isString(curlCommand)) {
            requestConverter.convert({ type: 'string', data: curlCommand }, function (err, result) {
                if (err) { throw err; }
                requestConfig = result;
            });
        }

        return requestConfig;
    },

    parseCurlOptions: function (options, url) {
        let requestConfig,
            curlCommand = 'curl ',
            headers;

        headers = _.reduce(options.H, (result, value) => {
            return result + `-H '${value}' `;
        }, '');

        curlCommand = curlCommand + '-X ' + String(options.method);
        curlCommand += ` ${url} `;
        curlCommand = curlCommand + '-d "' + String(options.data) + '"' + ' ';
        curlCommand += ` ${headers}`;
        requestConfig = this.getRequestFromCurlConfiguration(curlCommand);

        return requestConfig;
    }
};

module.exports = curlParser;
