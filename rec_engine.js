module.exports.findNearestNeighbors = function(user, users, movies, k, minOverlay) {
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
