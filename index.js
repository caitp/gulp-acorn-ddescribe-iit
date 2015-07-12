var acorn = require('acorn/dist/acorn_loose');
acorn.walk = require('acorn/dist/walk');
var through2 = require('through2');
var path = require('path');
var PluginError = require('gulp-util').PluginError;

module.exports = ddescribeIit;
function ddescribeIit(opt) {
	'use strict';
  opt = opt || {};

  var BAD_FUNCTIONS = [
    'iit',
    'ddescribe',

    'fit',
    'fdescribe',

    'it.only',
    'describe.only'
  ];

  var DISABLED_TEST_FUNCTIONS = [
    // jasmine / minijasminenode / angular
    'xit',
    'xdescribe',

    // TODO(@caitp): support mocha `this.skip()` api?
  ];

  var noColor = getOrDefault(opt, 'noColor', false);
  var supports_colors =  !noColor && /* istanbul ignore next */ (function() {
    // E2E testable, but trivial --- ignored
    if (process.argv.indexOf('--no-color') !== -1) return false;
    if (process.stdout && !process.stdout.isTTY) return false;
    if (process.platform === 'win32') return true;
    if ('COLORTERM' in process.env) return true;
    if (process.env.TERM === 'dumb') return false;
    if (/^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) return true;
    return false;
  })();
  var allowDisabledTests = getOrDefault(opt, 'allowDisabledTests', true);
  var basePath = getOrDefault(opt, 'basePath', process.cwd());
  var tabWidth = getOrDefault(opt, 'tabWidth', 4);
  if (typeof tabWidth !== 'number') tabWidth = 4;
  if (tabWidth < 2) tabWidth = 2;
  if (tabWidth > 8) tabWidth = 8;
  var tabString = '  ';
  while (tabString.length < tabWidth) tabString += ' ';

  if (!allowDisabledTests) {
    BAD_FUNCTIONS = BAD_FUNCTIONS.concat(DISABLED_TEST_FUNCTIONS);
  }

  var colors = {
    red: color(31, 39),
    gray: color(90, 39)
  };

  var errors = [];
  var fileContents = {__proto__: null};
  return through2.obj(processFile, flushStream);

  function processFile(file, enc, cb) {
    if (file.isNull()) return cb(null, file);
    if (file.isStream()) return cb(new PluginError('gulp-ddescribe-iit', 'Streaming not supported'));

    var path = toRelativePath(basePath, file.path);
    var contents = file.contents.toString();
    fileContents[path] = contents;
    var ast = acorn.parse_dammit(contents, {
      ecmaVersion: 6,
      locations: true
    });
    acorn.walk.simple(ast, {
      CallExpression: function(nodes) {
        var callee = makeCallee(nodes.callee);

        if (contains(BAD_FUNCTIONS, callee.value)) {
          errors.push(callee);
        }

        function makeCallee(ast, level) {
          var callee = {
            path: path,
            str: contents.substring(ast.start, ast.end),
            loc: ast.loc,
            start: ast.start,
            end: ast.end,
            value: '',
            raw: '',
          };
          switch (ast.type) {
            case 'Identifier':
              callee.raw = callee.value = ast.name;
              return callee;
            case 'MemberExpression':
              return makeMember(callee, ast.object, ast.property);
          }
        }
        function makeMember(callee, object, property, level) {
          callee.value = getCalleeName(object) + '.' + getCalleeName(property);
          var sep = property.type === 'Literal' ? '' : '.';
          callee.raw = getRawCalleeName(object) + sep + getRawCalleeName(property);
          return callee;
        }
        function getCalleeName(node) {
          switch (node.type) {
            case 'Identifier': return node.name;
            case 'Literal': return node.value;
            case 'MemberExpression':
              return getCalleeName(node.object) + '.' + getCalleeName(node.property);
            default: return '@';
          }
        }
        function getRawCalleeName(node) {
          switch (node.type) {
            case 'Identifier': return node.name;
            case 'Literal': return '[' + node.raw + ']';
            case 'MemberExpression':
              var sep = node.property.type === 'Literal' ? '' : '.';
              return getRawCalleeName(node.object) + sep + getRawCalleeName(node.property);
            default: return '@';
          }
        }
      }
    });
    cb();
  }

  function flushStream(cb) {
    if (errors.length) {
      // Sort errors by location
      errors.sort(function(a, b) {
        if (a.path === b.path) return a.start > b.start;
        return a.path > b.path;
      });

      var lines = { __proto__: null };
      var starts = { __proto__: null };
      errors = errors.map(function simplifyError(err) {
        var startIndex = err.start;
        var endIndex = err.end;
        var line = err.loc.start.line;
        var column = err.loc.start.column;
        var path = err.path;
        var word = err.str;
        if (!lines[path]) {
          var flines = lines[path] = fileContents[path].split('\n');
          var s = 0;
          starts[path] = flines.map(function(line) {
            var start = s;
            s += line.length;
            return start;
          });
        }

        return {
          file: path,
          str: simplifyString(word),
          line: line,
          column: column + 1,
          context: makeErrorContext(lines[path], starts[path], line, column, word)
        };
      });

      var error = new PluginError('gulp-ddescribe-iit', {
        message: '\n' + errors.map(function(error) {
          return 'Found `' + red(error.str) + '` in ' +
                 error.file + ':' + error.line + ':' + error.column + '\n' +
                 error.context;
        }).join('\n\n'),
        showStack: false,
        showProperties: false
      });
      error.raw = errors;
      this.emit('error', error);
    }
    cb();
  }

  function contains(collection, item) {
    return collection.indexOf(item) !== -1;
  }

  function simplifyString(str) {
    return str.
              replace(/\s+/g, '').
              replace(/(\\u([0-9a-fA-F]{4}))/g, replaceHex).
              replace(/(\\u\{([0-9a-fA-F]+)\})/g, replaceHex).
              replace(/(\\x([0-9a-fA-F]{2}))/g, replaceHex).
              replace(/(\\([0-7]{1,3}))/g, replaceOctal).
              replace(/(\\(.))/g, function($0, $1, $2) {
                return $2;
              });

    function replaceHex($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    }

    function replaceOctal($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 8));
    }
  }

  function color(open, close) {
    if (!supports_colors) return null;
    return {
      open: '\u001b[' + open + 'm',
      close: '\u001b[' + close + 'm'
    };
  }

  function getOrDefault(o, key, def) {
    var val = o[key];
    if (val === void 0) val = def;
    return val;
  }

  function gray(str) {
    return colorize('gray', str);
  }

  function red(str) {
    return colorize('red', str);
  }

  function colorize(code, str) {
    var c = colors[code];
    if (!c) return str;
    return '' + c.open + str + c.close;
  }

  function makeErrorContext(lines, lineStarts, line, column, word) {
    var words = word.split('\n').map(removeTabs).map(trim); // Word may occupy multiple lines
    var firstLineNo = line - 1;
    var lastLineNo = line + words.length;
    var numLines = lines.length;
    var lineSpaceNeeded = numLines.toString().length + 1;
    var before = firstLineNo > 0 ? removeTabs(lines[firstLineNo - 1]) : null;
    var middle = lines.slice(line - 1, line - 1 + words.length).map(removeTabs);
    var after = lastLineNo <= numLines ? removeTabs(lines[lastLineNo - 1]) : null;
    var middleLine = line;
    var middleIndex = 0;
    var isFirst = before !== null;
    var out = [].concat(before, middle, after).
        filter(function(x) { return x !== null; }).
        map(removeTabs).
        map(produceOutput);

    return out.join('\n') + '\n';

    function removeTabs(str) {
      return str.replace(/\t/g, tabString);
    }

    function produceOutput(str) {
      var isMiddle = !isFirst && middleIndex < words.length;
      var lineNo = isFirst ? line - 1 : (isMiddle ? middleLine++ : line + words.length);
      isFirst = false;
      if (!isMiddle) return writeLineNumber(lineNo) + str;
      var wordPart = words[middleIndex++];
      var index = str.indexOf(wordPart);
      var firstPart = writeLineNumber(lineNo) + str;
      var secondPart = wordPart.length
              ? '\n' + writeLineNumber(lineNo, true) + writeUnderline(index, wordPart.length)
              : '';
      return firstPart + secondPart;
    }

    function writeLineNumber(lineNo, isBlank) {
      var s = isBlank === true ? '' : lineNo.toString();
      while (s.length < lineSpaceNeeded) s = ' ' + s;
      return gray(s + '| ');
    }

    function writeUnderline(start, len) {
      var s = '';
      while (s.length < start) s = ' ' + s;
      var u = '';
      while (u.length < len) u = '^' + u;
      return s + red(u);
    }

    function trim(str) {
      return str.replace(/^\s+/, '').replace(/\s+$/, '');
    }
  }

  function toRelativePath(basePath, filePath) {
    if (!basePath) return filePath;
    return path.relative(basePath, filePath);
  }
}
