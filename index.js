'use strict';

// Libraries
let chalk  = require('chalk');
let tracer = require('tracer');
let fs     = require('fs');

let config = (() => {
  try {
    return require('config');
  }
  catch (error) {
    return {};
  }
})();

// Variables
let log     = {debug: o => o};
let loggers = {};
let levelNumbers = {
  log:   0,
  trace: 1,
  debug: 2,
  info:  3,
  warn:  4,
  error: 5
};

let wildcards = {};

let wildcard = search => {
  if (!wildcards[search]) {
    wildcards[search] = new RegExp(
      String(search)
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      , 'i'
    );
  }

  return wildcards[search];
};

let logLevels = {};
let logLevel = function(name) {
  if (!logLevels[name]) {
    for (let level of Object.keys(config.logs || {})) {
      if (wildcard(level).test(name)) {
        logLevels[name] = config.logs[level];
        break;
      }
    }

    if (!logLevels[name]) logLevels[name] = config.defaultLogLevel || 'info';
  }

  return logLevels[name];
};

// ----------[ Create Logfiles ]----------------------------------------
let logFiles = [];

try {
  for (let fileName in config.logFiles || {}) {
    if (config.logFiles.hasOwnProperty(fileName)) {
      let setting = config.logFiles[fileName];
      // Add this logFile to the batch
      logFiles.push({
        level:    levelNumbers[setting.level || 'log'] || 0,
        file:     fs.openSync(fileName, 'w'),
        fileName: fileName,
      });
    }
  }
}
catch (e) {
  console.log(e.stack);
}

let getLogger = function(name, level) {
  // Make the logger if it doesn't exist
  if (!loggers[name]) {
    // Log
    log.debug('Creating logger [%s] with level (%s)', name, logLevel(name));

    // Make the logger
    loggers[name] = tracer.colorConsole({
      dateformat: 'HH:MM',
      level:      level || logLevel(name),
      inspectOpt: {
        colors:     true,
        showHidden: true,
        depth:      3,
      },
      filters: {
        log:   chalk.reset,
        trace: chalk.magenta,
        debug: chalk.cyan,
        info:  chalk.reset,
        warn:  chalk.yellow,
        error: [chalk.red, chalk.bold]
      },
      format: [
        chalk.white(name) + chalk.gray('/') +
          chalk.green('{{title}}') +
          ': {{message}}',
        {
          warn: chalk.white(name) + chalk.gray('/') +
            chalk.yellow('{{title}}') +
            ': ({{file}}:{{line}}) {{message}}',
          error: chalk.white(name) + chalk.gray('/') +
            chalk.red('{{title}}') +
            ': ({{file}}:{{line}}) {{message}}',
          debug: chalk.white(name) + chalk.gray('/') +
            chalk.cyan('{{title}}') +
            ' ({{file}}:{{line}}) {{message}}',
        },
      ],
      transport: [
        data => {
          // Log to the console
          console.log(data.output);
          // Write to the log files
          for (let logFile of logFiles) {
            if (data.level >= logFile.level) {
              try {
                const colorLess = chalk.stripColor(data.output + '\n');
                fs.write(logFile.file, colorLess, () => {});
              }
              catch (e) {
                console.error(
                  'Unable to write to log file %s',
                  logFile.fileName
                );
              }
            }
          }
        },
      ],
    });
  }

  return loggers[name];
};

// The log has a logger
log = getLogger('log');

module.exports          = getLogger;
module.exports.logLevel = logLevel;
