let fs = require('fs'); 
let split = require('split');
let parse = require('csv-parse');

module.exports.readRatings = function (path, users, common, cb) {
	fs.createReadStream(path + 'ratings.csv')
		.pipe(split())
		.on('data', function(data) {
			const row = data.split(',');
			const uid  = Number(row[0]);
			const mid  = Number(row[1]);
			const val  = Number(row[2]);
			const time = Number(row[3]);
			if(uid != null) {
				if(users[uid] == null) 
					users[uid] = new common.User();

				users[uid].ratings[mid] = new common.Rating(val, time);
			}
		})
		.on('end',function() {
			cb();
		});
}

module.exports.readMovies = function (path, movies, common, cb) {
	fs.createReadStream(path + 'movies.csv')
		.pipe(parse({delimiter: ','}))
		.on('data', function(data) {
			const mid    = Number(data[0]);
			const title  = Number(data[1]);
			//const genres = data[2].split('|'); // TODO
			if(mid != null) {
				movies[mid] = new common.Movie(title);
			}
		})
		.on('end',function() {
			cb();
		});
}
