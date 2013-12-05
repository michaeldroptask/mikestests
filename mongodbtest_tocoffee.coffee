mongojs = require("mongojs");
fs = require("fs");

for argument, index in process.argv
	if index == 2
		updateMongo(argument)

updateMongo (folder) ->
	validateExists (exists) ->
		if exists
			readFiles folder

	fs.exists folder, validateExists

readFiles (folder) ->
	checkFiles (err, files) ->
		if err
			console.log "error reading folder! " + err;
		else
			db = mongojs.connect("test", ["files"])

			closeDB ->
				console.log "closing db"
				db.close()

			updateMongoForFiles db, folder, files, closeDB

updateMongoForFiles (db, folder, files, callback) ->
	for file, index in files
		if index ==files.length - 1
			updateMongoForFileOrFolder db, folder, file, callback
		else
			updateMongoForFileOrFolder db, folder, file, null

updateMongoForFileOrFolder (db, folder, file, callback) ->
	handleRead (err, files) ->
		if err or (not files) or files.length == 0
			updateMongoForFile db, folder, file, callback
		else
			updateMongoForFiles db folder + "\\" + file, files, callback

	fs.readdir(folder + "\\" + file, handleRead)

updateMongoForFile (db, folder, file, callback) ->
	handleFind (err, files) ->
		if err or (not files) or files.length == 0
			addFileToMongo db, folder, file, callback
		else
			console.log "file already exists in mongo [" + folder + "\\" + file + "]"
			if callback != null
				callback()

	db.files.find {filePath : folder + "\\" + file}, handleFind


addFileToMongo (db, folder, file, callback) ->
	handleSave (err, saved) ->
		if err || (not saved)
			console.log "Could not save file![" + folder + "\\" + file + "] err=" + err
		else
			console.log "File saved successfully[" + folder + "\\" + file + "]"
			if callback != null
				callback()