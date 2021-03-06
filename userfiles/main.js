let textbox = document.getElementById('input');
let titleHelper = document.getElementById('titleHelper');
let selectedEl = document.getElementById('selected');
let recommended = document.getElementById('recommended');
let profile = [];
let downloaded = {};
let rating = {};

let timeoutId = null;
textbox.addEventListener('input', function(event) {
	if(timeoutId != null) {
		window.clearTimeout(timeoutId);
	}
	timeoutId = setTimeout(function() {requestTitles(textbox.value)}, 300);
});

function requestTitles() {
	let request = new XMLHttpRequest();
	request.open('POST', 'title/', true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send('str=' + encodeURIComponent(textbox.value));
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			let response = JSON.parse(request.responseText);
			titleHelper.innerHTML = '';
			for(let i in response) {
				let onclick = 'onclick="add(' + response[i].mid + ')"';
				let html = '<li class="selectable align" ' + onclick + '>' + response[i].title + '</li>';
				titleHelper.innerHTML += html;
				downloaded[response[i].mid] = response[i].title;
			}
		}
	}
}

function add(mid) {
	if(profile.indexOf(mid) == -1) {
		profile.push(mid);
		rating[mid] = 5;
		rebuild();
	}
}

function remove(mid) {
	profile.splice(profile.indexOf(mid), 1);
	rebuild();
}

function format(num) {
	num = Math.floor(num * 10) / 10;
	if(Math.floor(num) == Math.ceil(num)) {
		return '' + num + '.0';
	} else {
		return '' + num;
	}
}

function rebuild() {
	selected.innerHTML = '';
	for(let i = profile.length - 1;i >= 0;i --) {
		const mid = profile[i];
		let button1Ac = 'onclick="rate(-0.5,' + mid + ')"';
		let button2Ac = 'onclick="rate(+0.5,' + mid + ')"';
		let button1 = '<input type="button" value="-" ' + button1Ac + '>';
		let button2 = '<input type="button" value="+" ' + button2Ac + '>';
		let rate = '<span id="rating_' + mid + '">&nbsp;' + format(rating[mid]) + '/5.0&nbsp;</span>';

		let ratebtns = '<span id="ratebtns">' + button1 + rate + button2 + '</span>';
		let rembtn = '<input type="button" onclick="remove(' + mid + ')" value="X">';
		let html = '<li class="align">' + rembtn + '&nbsp;' + downloaded[mid] + '&nbsp;' + ratebtns + '</li>';
		selected.innerHTML += html;
	}
}

function submitProfile() {
	let data = [];
	for(let i in profile) {
		data.push({mid: profile[i], r: rating[profile[i]]});
	}
	let request = new XMLHttpRequest();
	request.open('POST', 'getr/', true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send('data=' + encodeURIComponent(JSON.stringify(data))
	          + '&treshold=4');
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			let data = JSON.parse(request.responseText);
			recommended.innerHTML = '';
			for(let i in data) {
				data[i].mid = Number(data[i].mid);
				if(profile.indexOf(data[i].mid) == -1) {
					let html = '<li class="align">' + format(data[i].v) + '/5.0 - ' + data[i].t + '</li>';
					recommended.innerHTML += html;
				}
			}
		}
	}

}

function rate(val, mid) {
	rating[mid] += val;
	if(rating[mid] > 5) rating[mid] = 5;
	if(rating[mid] < 0) rating[mid] = 0;
	rebuild();
}
