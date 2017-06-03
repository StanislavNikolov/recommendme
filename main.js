let common = require('./common');
let dataLoader = require('./load_data');

const dataPath = './datasets/ml-20m/';

let ratings = {};
let users = {};
let movies = {};

let done = 0;

dataLoader.readRatings(dataPath, users, common, function() {
	console.log('Done reading ratings.csv');
	done ++;
	if(done == 2) ready();
});
dataLoader.readMovies(dataPath, movies, common, function() {
	console.log('Done reading movies.csv');
	done ++;
	if(done == 2) ready();
});

function ready() {
}

