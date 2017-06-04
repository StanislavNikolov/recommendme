require('string_score'); // string.score

let common     = require('./common');
let dataLoader = require('./load_data');
let engine = require('./rec_engine');
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
	console.log('ready');
}

let app        = require("express")();
let bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function fuzzyMatch(word, k, fuz) {
	let topTitles = [];
	for(let i = 0;i < k;i ++)
		topTitles.push({mid: null, score: 0});

	function cmp(a, b) { return b.score - a.score; }

	for(let i in movies) {
		const score = movies[i].title.score(word, fuz);
		if(score > topTitles[k-1].score) {
			topTitles[k-1].score = score;
			topTitles[k-1].mid = i;
			topTitles.sort(cmp);
		}
	}

	return topTitles;
}

app.post('/title', function(req, res) {
	let sum = {};

	const words = req.body.str.split(' ');
	const commonWords = ["the", "be", "to", "of", "a", "in", "as", "at"];
	for(let w in words) {
		let match = fuzzyMatch(words[w], 100, 0);
		let mul = 1;
		if(commonWords.indexOf(words[w]) != -1) {
			mul = 0.01;
		}
		for(let i in match) {
			if(sum[match[i].mid] == null)
				sum[match[i].mid] = 0;
			sum[match[i].mid] += match[i].score * mul;
		}
	}

	let match = fuzzyMatch(req.body.str, 100, 0.6);
	let mul = 3;
	for(let i in match) {
		if(sum[match[i].mid] == null) 
			sum[match[i].mid] = 0;
		sum[match[i].mid] += match[i].score * mul
	}

	function cmp(a, b) { return b.score - a.score; }

	let ans = [];
	for(let i in sum) {
		if(sum[i] != 0) {
			ans.push({title: movies[i].title, score: sum[i], mid: i});
		}
	}

	ans.sort(cmp);
	ans = ans.slice(0, 20);

	res.send(ans);
});

app.post('/getr', function(req, res) {
	let data = JSON.parse(req.body.data);
	let treshold = req.body.treshold;
	let user = new common.User();
	for(let i in data) {
		user.ratings[data[i].mid] = new common.Rating(data[i].r, 0);
	}

	let recm = engine.findNearestNeighbors(user, users, movies, 10, data.length / 2 + 1).topMovies;
	let ans = [];
	for(let i in recm) {
		if(recm[i].value > req.body.treshold) {
			ans.push({mid: recm[i].mid, t: movies[recm[i].mid].title, v: recm[i].value});
		}
		if(ans.length > 20) break;
	}
	res.send(ans);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/userfiles/index.html");
});
app.get("/userfiles/*", function(req, res) {
	res.sendFile(__dirname + req.url);
});

let port = process.env.PORT || 3000;
let server = app.listen(port, function() {
	let host = server.address().address;
	let port = server.address().port;

	console.log("Starting server on http://%s:%s", host, port);
});
