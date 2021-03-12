const _ = require('lodash'),
    waterfall = require('async/waterfall'),
    { Command } = require('commander'),
    util = require('./util'),
    { Runner } = require('postman-request-runtime');

const program = new Command();

program.command('launch <url>')
       .description('Run single request directly using this command, provide your options and then view them using your favorite reporters')
       .usage('<url> [options]')
       .option('-m, --method <item>','Option for specifying method of the request', 'GET')
       .option('--verbose', 'Verbose option for detailed information of the request run', false)
       .option('-d, --form-data', 'Option for sending form data along with the request.')
       .option('-h,--header', 'Option for sending custom headers with the request.')
       .option('-H,--existing-header', 'Option for modifying already set headers in the request')
       .option('-q,--query', 'Option for sending query parameters with the request.')
       .option('-ref,--referrer', 'Option for specifying a referrer URL if any.')
       .option('-r, --reporters [reporters]', 'Specify the reporters to use for this run', util.cast.csvParse, ['cli'])
       .option('-n, --iteration-count <n>', 'Define the number of iterations to run', util.cast.integer)       
       .option('--global-var <value>',
           'Allows the specification of global variables via the command line, in a key=value format',
            util.cast.memoizeKeyVal, [])
        .option('--env-var <value>',
            'Allows the specification of environment variables via the command line, in a key=value format',
            util.cast.memoizeKeyVal, [])
        .option('--sync-environment', 'Update the corresponding environment in Postman-Cloud with the ' +
            'resultant environment')
        .option('--export-environment <path>', 'Exports the final environment to a file after completing the run')
        .option('--export-globals <path>', 'Exports the final globals to a file after completing the run')
        .option('--export-request <path>', 'Exports the executed request to a file after completing the run')
        .option('--postman-api-key <apiKey>', 'API Key used to load the resources from the Postman API')
        .option('--bail [modifiers]',
            'Specify whether or not to gracefully stop a request run on encountering an error' +
            ' and whether to end the run with an error based on the optional modifier', util.cast.csvParse)
        .option('--ignore-redirects', 'Prevents Newman from automatically following 3XX redirect responses')
        .option('-x , --suppress-exit-code', 'Specify whether or not to override the default exit code for the current run')
        .option('--silent', 'Prevents Newman from showing output to CLI')
        .option('--disable-unicode', 'Forces Unicode compliant symbols to be replaced by their plain text equivalents')
        .option('--color <value>', 'Enable/Disable colored output (auto|on|off)', util.cast.colorOptions, 'auto')
        .option('--timeout-request [n]', 'Specify a timeout for requests (milliseconds)', util.cast.integer, 0)
        .option('--timeout-script [n]', 'Specify a timeout for scripts (milliseconds)', util.cast.integer, 0)
        .option('--speed-time', 'Option for specifying the time of observation in case transfer speed falls below the limit')
        .option('--speed-limit', 'Option for specifying the minimum transfer rate.')
        .option('-w,--write-out', 'Option for logging some of the parameters of the response on the console.')
        .option('--report-path', 'Option for logging path of the reports on the console.')
        .option('--credentials', 'Option for specifying withCredentials parameter in case of CORS requests.', false)
        .action((url,command) => {
           
            let options = util.commanderToObject(command),
                type = util.identifyTypeOfRequest(String(url)),
                requestObject,
                parsedOptions;
            if (type === 'curl') {
                requestObject = util.parseCurlRequest(url, options);
            }
            else if (type === 'custom') {
                requestObject = util.parseCustomRequest(url, options);
            }
            parsedOptions = util.getOptions(options);

            newman.launch(options, function (err, summary) {
                const runError = err || summary.run.error || summary.run.failures.length;
    
                if (err) {
                    console.error(`error: ${err.message || err}\n`);
                    err.friendly && console.error(`  ${err.friendly}\n`);
                }
                runError && !_.get(options, 'suppressExitCode') && process.exit(1);
            });
        });


