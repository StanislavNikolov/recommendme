module.exports.User = class User {
	constructor() {
		this.ratings = {};
	}
}

module.exports.Movie = class Movie {
	constructor(title) {
		this.title = title;
	}
}

module.exports.Rating = class Rating {
	constructor(value, timestamp) {
		this.value = value;
		this.timestamp = timestamp;
	}
}

