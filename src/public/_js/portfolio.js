var _data, _carret_timeout;

function changeFilter(type, value) {
	var filter = document.getElementById("filter");
	var carret = document.getElementById("carret");
	var portfolio = document.getElementById("portfolio");

	filter.innerHTML = '<span class="code_custom">get<span class="only-desktop">Works</span>By<span class="only-desktop">Filter</span></span>(.<span class="code_custom">' + type + '</span>(<span class="code_' + (type === 'tag' ? 'string' : 'number') + '">' + (type === 'tag' ? ('"' + value + '"') : value) + '</span>))';
	portfolio.innerHTML = '';

	carret.classList.remove("hidden");
	if(_carret_timeout) clearTimeout(_carret_timeout);
	_carret_timeout = setTimeout(function() {
		if(_data) carret.classList.add("hidden");
	}, 2800);

	if(!_data || !_data.works) return;

	switch(type) {
		case "year":
			return printPortfolio(_data.works.filter(work => work.year === value.toString()).sort((a,b) => { return parseInt(b.number, 10) - parseInt(a.number, 10) }), portfolio, true);
		case "tag":
			return printPortfolio(_data.works.filter(work => work.tags.includes(value)).sort((a,b) => { return parseInt(b.year, 10) - parseInt(a.year, 10) }), portfolio, false);
	}
}

function printPortfolio(data, portfolio, noYear) {
	var html = "";

	// var highlighted = data.filter(work => work.info && work.info.highlight);

	// for (var i = 0; i < highlighted.length; i++) {
	// 	var work = highlighted[i];

	// 	html += '<a class="work highlighted" style="background-color: ' + work.info.logo + '" href="/portfolio/' + work.year + '-' + work.number + '">\
	// 				<div class="logo">\
	// 					<div class="bg" style="background-color: ' + work.info.logo + '; background-image: url(/_images/catalog/' + work.year + '-' + work.number + '-logo.png)"></div>\
	// 					<div class="number" style="color: ' + (work.info.logo ? 'transparent' : 'black') + '">' + work.number + '</div>\
	// 				</div>\
	// 				' + (!noYear ? '<div class="year">' + work.year + '</div>' : '') + '\
	// 				<div class="info">\
	// 					<div class="title">' + work.info.title + '</div>\
	// 					<div class="subtitle">' + work.info.subtitle + '</div>\
	// 					<div class="icons">' + iconsForWork(work) + '</div>\
	// 				</div>\
	// 				<div class="description">' + work.info.description + '</div>\
	// 			</a>';
	// }

	for (var i = 0; i < data.length; i++) {
		var work = data[i];

		// if(highlighted.includes(work)) continue;

		if(!work.info || Object.keys(work.info).length === 1) work.info = { title: work.name };

		html += '<a class="work' + (Object.keys(work.info).length === 1 ? ' disabled' : '') + '" href="' + (window.location.pathname.substr(0,3) === '/ru' ? '/ru/portfolio/' : '/portfolio/') + work.year + '-' + work.number + '-' + work.name + '">\
					<div class="logo">\
						<div class="bg" style="background-color: ' + work.info.logo + '; background-image: url(/_images/catalog/' + work.year + '-' + work.number + '-logo.png)"></div>\
						<div class="number" style="color: ' + (work.info.logo ? 'transparent' : 'black') + '">' + work.number + '</div>\
					</div>\
					' + (!noYear ? '<div class="year">' + work.year + '</div>' : '') + '\
					<div class="info">\
						<div class="title">' + (work.info.title || work.name) + '</div>\
						<div class="subtitle">' + (work.info.subtitle || '') + '</div>\
						<div class="icons">' + iconsForWork(work) + '</div>\
					</div>\
				</a>';
	}

	portfolio.innerHTML = html;

	scrollToTop(700);
}

function iconsForWork(work) {
	var icons = "";

	for (var k = 0; k < work.tags.length; k++) {
		var tag = work.tags[k];

		icons += '<div title="' + tag + '" class="icon ' + tag.replace(".","-").toLowerCase() + '"></div>';
	}

	return icons;
}

function scrollToTop (duration) {
    if (document.scrollingElement.scrollTop === 0) return;

    const cosParameter = document.scrollingElement.scrollTop / 2;
    let scrollCount = 0, oldTimestamp = null;

    function step (newTimestamp) {
        if (oldTimestamp !== null) {
            scrollCount += Math.PI * (newTimestamp - oldTimestamp) / duration;
            if (scrollCount >= Math.PI) return document.scrollingElement.scrollTop = 0;
            document.scrollingElement.scrollTop = cosParameter + cosParameter * Math.cos(scrollCount);
        }
        oldTimestamp = newTimestamp;
        window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}

function updateHash() {
	var hash = location.hash.replace("#", "");

	if(!hash.length) return changeFilter("year", new Date().getFullYear());

	if(/[0-9]{4}/.test(hash)) changeFilter("year", hash);
	else changeFilter("tag", hash);
}

function init() {
	updateHash();

	XHR("/catalog" + (window.location.pathname.substr(0,3) === '/ru' ? '.ru' : '') + ".json", null, function(data) {
		_data = data;

		updateHash();
	}, function(error) {
		console.log(error);
	});
}

addEventListener("load", init);
addEventListener("hashchange", updateHash);