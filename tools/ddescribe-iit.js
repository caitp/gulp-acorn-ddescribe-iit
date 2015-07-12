#!/usr/bin/env node

// Runs this plugin on the test suite, to prevent errors from sneaking in.
// Requires the devDependencies installed to work.

var ddescribeIit = require('..');
var File = require('vinyl');
var fs = require('fs');
var path = require('path');
var PROJECT_ROOT = path.dirname(__dirname);
var TEST_DIR = path.join(PROJECT_ROOT, 'test');
var SKIP_DIRS = [
  'test/data'
].map(function(p) {
  return path.resolve(PROJECT_ROOT, p);
});

var stream = ddescribeIit({ basePath: PROJECT_ROOT });
var errored = false;
stream.on('error', function(err) {
  console.error(err.toString());
  errored = true;
});

stream.on('finish', function() {
  process.exit(errored ? 1 : 0);
});

addDirs(TEST_DIR);
stream.end();

function addDirs(root) {
  fs.readdirSync(root).
    forEach(function(p) {
      p = path.join(root, p);
      if (isDir(p)) {
        if (!contains(SKIP_DIRS, p)) {
          addDirs(p);
        }
      } else {
        addFile(p);
      }
    })
}

function addFile(fileName) {
  var contents = fs.readFileSync(fileName);
  stream.write(new File({
    path: fileName,
    contents: contents
  }));
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

function contains(collection, element) {
  return collection.indexOf(element) >= 0;
}
