mongojs = require("mongojs");
fs = require("fs");

process.argv.forEach(function (val, index, array) {
	if (index == 2) {
  		console.log(index + ': ' + val + " used for mongo db");
  		updateMongo(val);
	} else {
  		console.log(index + ": " + val + " ignored");
	}
});

function updateMongo(folder) {
	console.log("update mongodb for folder=" + folder);

	var validateExists = function (exists) {
		if (exists) {
			readFiles(folder);
		} else {
			console.log("folder does not exist=" + folder);
		}
	}
	fs.exists(folder,validateExists);
}

function readFiles(folder) {
	fs.readdir(folder, function(err, files) {
		if (err) {
			console.log("error reading folder! " + err);
		} else {

			var dbUrl = "test";
			var collections = ["files"];
			var db = mongojs.connect(dbUrl, collections);

			var closeDB = function() {
				console.log("closing db");
				db.close();
			}
			updateMongoForFiles(db, folder, files, closeDB);
		}
	});
}

function updateMongoForFiles(db, folder, files, callback) {

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		// console.log("processing file=" + file);
		if (i == files.length - 1) {
			updateMongoForFileOrFolder(db, folder, file, callback);
		} else {
			updateMongoForFileOrFolder(db, folder, file, null);
		}
	}
}

function updateMongoForFileOrFolder(db, folder, file, callback) {
	fs.readdir(folder + "\\" + file, function(err, files) {
		if (err || !files || files.length == 0) {
			// should be a file
			// console.log("updating file=" + file + " [err=" + err + ", files=" + files + "]");
			updateMongoForFile(db, folder, file, callback);
		} else {
			// update for subfolder
			console.log("navigating subfolder=" + folder + "\\" + file);
			updateMongoForFiles(db, folder + "\\" + file, files, callback);
		}
	});
}

function updateMongoForFile(db, folder, file, callback) {
	db.files.find({filePath : folder + "\\" + file}, function(err, files) {
		if (err || !files || files.length == 0) {
			addFileToMongo(db, folder, file, callback);
		} else {
			console.log("file already exists in mongo [" + folder + "\\" + file + "]");
			if (callback != null) {
				callback();
			}
		}
	});
}

function addFileToMongo(db, folder, file, callback) {
	db.files.save({filePath: folder + "\\" + file, parentFolder : folder, filename : file}, function(err, saved) {
		if (err || !saved) {
			console.log("Could not save file![" + folder + "\\" + file + "] err=" + err);
		} else {
			console.log("File saved successfully[" + folder + "\\" + file + "]");
		}
		if (callback != null) {
			callback();
		}
	});
}