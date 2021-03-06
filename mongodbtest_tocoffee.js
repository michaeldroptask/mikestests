// Generated by CoffeeScript 1.6.3
var argument, fs, index, mongojs, _i, _len, _ref;

mongojs = require("mongojs");

fs = require("fs");

_ref = process.argv;
for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
  argument = _ref[index];
  if (index === 2) {
    updateMongo(argument);
  }
}

updateMongo(function(folder) {
  validateExists(function(exists) {
    if (exists) {
      return readFiles(folder);
    }
  });
  return fs.exists(folder, validateExists);
});

readFiles(function(folder) {
  return checkFiles(function(err, files) {
    var db;
    if (err) {
      return console.log("error reading folder! " + err);
    } else {
      db = mongojs.connect("test", ["files"]);
      closeDB(function() {
        console.log("closing db");
        return db.close();
      });
      return updateMongoForFiles(db, folder, files, closeDB);
    }
  });
});

updateMongoForFiles(function(db, folder, files, callback) {
  var file, _j, _len1, _results;
  _results = [];
  for (index = _j = 0, _len1 = files.length; _j < _len1; index = ++_j) {
    file = files[index];
    if (index === files.length - 1) {
      _results.push(updateMongoForFileOrFolder(db, folder, file, callback));
    } else {
      _results.push(updateMongoForFileOrFolder(db, folder, file, null));
    }
  }
  return _results;
});

updateMongoForFileOrFolder(function(db, folder, file, callback) {
  handleRead(function(err, files) {
    if (err || (!files) || files.length === 0) {
      return updateMongoForFile(db, folder, file, callback);
    } else {
      return updateMongoForFiles(db(folder + "\\" + file, files, callback));
    }
  });
  return fs.readdir(folder + "\\" + file, handleRead);
});

updateMongoForFile(function(db, folder, file, callback) {
  handleFind(function(err, files) {
    if (err || (!files) || files.length === 0) {
      return addFileToMongo(db, folder, file, callback);
    } else {
      console.log("file already exists in mongo [" + folder + "\\" + file + "]");
      if (callback !== null) {
        return callback();
      }
    }
  });
  return db.files.find({
    filePath: folder + "\\" + file
  }, handleFind);
});

addFileToMongo(function(db, folder, file, callback) {
  return handleSave(function(err, saved) {
    if (err || (!saved)) {
      return console.log("Could not save file![" + folder + "\\" + file + "] err=" + err);
    } else {
      console.log("File saved successfully[" + folder + "\\" + file + "]");
      if (callback !== null) {
        return callback();
      }
    }
  });
});
