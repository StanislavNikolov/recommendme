require('string_score'); // adds string.score

let common     = require('./common');
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
	console.log('ready');
	let tu = new common.User();

	//TEST DATA - asen
	tu.ratings[858] = new common.Rating(5, 0);
	tu.ratings[318] = new common.Rating(5, 0);
	tu.ratings[1193] = new common.Rating(5, 0);
	tu.ratings[912] = new common.Rating(5, 0);
	tu.ratings[3462] = new common.Rating(5, 0);
	tu.ratings[130219] = new common.Rating(5, 0);
	tu.ratings[7153] = new common.Rating(5, 0);

	tu.ratings[89745] = new common.Rating(3, 0);
	tu.ratings[4896] = new common.Rating(3, 0);
	tu.ratings[2949] = new common.Rating(3, 0);
	tu.ratings[4396] = new common.Rating(3, 0);
	tu.ratings[3793] = new common.Rating(3, 0);

	tu.ratings[110553] = new common.Rating(1, 0);

	let res = findNearestNeighbors(tu, 10, Object.keys(tu.ratings).length / 2 + 1);
	//let res = findNearestNeighbors(tu, 10, 3);
	//console.log(res.topUsers);
	//console.log(res.topMovies);
	//console.log(res.topMovies[3717]);
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
	const commonWords = ["the", "be", "to", "of", "and", "a", "in", "have", "as", "at"];
	for(let w in words) {
		let match = fuzzyMatch(words[w], 100, 0);
		let mul = 1;
		if(commonWords.indexOf(words[w]) != -1) {
			mul = 0.05;
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


function findNearestNeighbors(user, k, minOverlay) {
	let topUsers = [], topMovies = [];
	for(let i = 0;i < k;i ++)
		topUsers.push({uid: null, sim: 0});

	function cmp(a, b) { return b.sim - a.sim; }

	for(let i in users) {
		const other = users[i];
		const similarity = euclideanDistance(user, users[i], minOverlay);
		if(similarity > topUsers[k-1].sim) {
			topUsers[k-1].sim = similarity;
			topUsers[k-1].uid = i;
			topUsers.sort(cmp);
		}
	}

	for(let i in movies) {
		let weightedSum = 0;
		let similaritySum = 0;
		for(let j in topUsers) {
			const uid = topUsers[j].uid;
			const sim = topUsers[j].sim;
			if(uid != null && sim != null && users[uid].ratings[i] != null) {
				const val = users[uid].ratings[i].value;
				if(val != null) {
					weightedSum += val * sim;
					similaritySum += sim;
				}
			}
		}
		if(similaritySum != 0) {
			const stars = weightedSum / similaritySum;
			topMovies.push({mid: i, sim: similaritySum, value: stars});
		}
	}

	topMovies.sort(cmp);

	return {topUsers: topUsers, topMovies: topMovies};
}

function euclideanDistance(user1, user2, minOverlay) {
	let sumSquares = 0;
	let overlay = 0;
	for(let i in user1.ratings) {
		if(user2.ratings[i] != null) {
			const val1 = user1.ratings[i].value;
			const val2 = user2.ratings[i].value;
			const diff = val1 - val2;
			sumSquares += diff * diff;
			overlay ++;
		}
	}
	const d = Math.sqrt(sumSquares);
	const similarity = 1 / (1 + d);
	if(overlay >= minOverlay) {
		return similarity;
	} else {
		return -1;
	}
}
