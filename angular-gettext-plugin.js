// Based on https://github.com/augusto-altman/angular-gettext-plugin/blob/master/index.js
// It allows to specify muliple glob patterns
'use strict';

const Compiler = require('./angular-gettext-compiler');
const Extractor = require('./angular-gettext-extractor');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
var shell = require('shelljs');

function AngularGetTextPlugin(options) {
  this.compileTranslations = options.compileTranslations;
  this.extractStrings = options.extractStrings;
}

function compile(options) {
  // https://github.com/rubenv/grunt-angular-gettext/blob/master/tasks/compile.js#L7
  if (!Compiler.hasFormat(options.format)) {
    throw new Error('There is no "' + options.format + '" output format.');
  }

  const compiler = new Compiler({
    format: options.format
  });

  const filePaths = glob.sync(options.input)
  const outputs = filePaths.map( (filePath) => {
    const content = fs.readFileSync(filePath, options.encoding || 'utf-8');
    const fullFileName = path.basename(filePath);
    return {
      content: compiler.convertPo(content),
      fileName: path.basename(filePath, path.extname(fullFileName)) + '.' + options.format
    };
  } );

  return outputs;
}

AngularGetTextPlugin.prototype.apply = function(compiler) {
  const options = this;

  compiler.plugin('emit', (compilation, done) => {

    if (options.compileTranslations) {
      shell.mkdir('-p', options.compileTranslations.outputFolder);
      const results = compile(options.compileTranslations);
      results.forEach( (result) => {
        const { fileName, content } = result;
        const outPath = path.join(options.compileTranslations.outputFolder, fileName);
        fs.writeFileSync(outPath, content);
        compilation.assets[outPath] = {
          source: function() {
            return content;
          },
          size: function() {
            return content.length;
          }
        };
      } );
    }

    if (options.extractStrings) {
      var extractor = new Extractor(options.extractStrings);

      options.extractStrings.patterns.forEach(pattern => {
        const filePaths = glob.sync(pattern);
        filePaths.forEach( (fileName) => {
            var content = fs.readFileSync(fileName, 'utf8');
            extractor.parse(fileName, content);
        });
      });
      fs.writeFileSync(options.extractStrings.destination, extractor.toString())
    }

    done();
  });
};

module.exports = AngularGetTextPlugin;
