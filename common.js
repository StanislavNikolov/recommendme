module.exports.User = class User {
	constructor() {
		this.ratings = [];
	}
}

module.exports.Movie = class Movie {
	constructor(title) {
		this.title = title;
	}
}

module.exports.Rating = class Rating {
	constructor(userId, movieId, value, timestamp) {
		this.userId = userId;
		this.movieId = movieId;
		this.value = value;
		this.timestamp = timestamp;
	}
}

