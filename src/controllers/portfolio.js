const fs = require("fs")

module.exports = function (app) {

	app.get("/:lang?/portfolio/:year-:number-:name", getWork)

	async function getWork(req, res) {
		const { year, number, lang } = req.params

		if(!year || !/^[0-9]{4}$/.test(year) || !number || !/^[0-9]{2}$/.test(number)) return res.redirect("/")

		const catalog = require(__dirname + "/../public/catalog" + (lang === "ru" ? ".ru" : "") + ".json")
		const work = catalog.works.filter(work => work.year === year && work.number === number)[0]

		if(!work || !work.info || !work.info.title) return res.redirect("/")

		var additional_work = catalog.works.filter(_work => _work.info && _work.info.highlight && _work.year === work.year && _work.number !== work.number).sort(() => .5 - Math.random())[0]
		if(!additional_work) additional_work = catalog.works.filter(_work => _work.info && _work.info.highlight && (_work.year !== work.year || _work.number !== work.number)).sort(() => .5 - Math.random())[0]
		if(!additional_work) additional_work = catalog.works.filter(_work => _work.info && (_work.year !== work.year || _work.number !== work.number)).sort(() => .5 - Math.random())[0]

		fs.readFile(__dirname + "/../public/" + (lang === "ru" ? "ru/" : "") + "portfolio/_work.html", (err, data) => {
			var html = data.toString()

			var icons = "";
			var links = "";
			var files = "";

			for (var i = 0; i < work.tags.length; i++) {
				const tag = work.tags[i]

				icons += '<div class="icon-wrapper"><div title="' + tag + '" class="icon ' + tag.replace(".","-").toLowerCase() + '"></div> <span>' + tag + '</span></div>';
			}

			if (work.info.files) {
				for (var i = 0; i < work.info.files.length; i++) {
					const file = work.info.files[i]

					files += '<a target="_blank" href="/_images/catalog/' + file.file + '"><img class="file" style="background-color: ' + file.color + '" src="/_images/catalog/' + file.file + '" /></a>'
				}
			}

			if(work.info.url) links += '<a target="_blank" href="' + work.info.url + '">' + work.info.url.replace("https://","").replace("http://","") + '</a>'
			if(work.info.ios) links += (links.length ? ' | ' : '') + '<a target="_blank" href="' + work.info.ios + '">iOS app</a>'
			if(work.info.android) links += (links.length ? ' | ' : '') + '<a target="_blank" href="' + work.info.android + '">Android app</a>'

			html = html.replace(new RegExp("<!-- CONTENT -->", "g"), '\
				<div class="get">\
					<h2>print <span class="code_custom">get<span class="only-desktop">Work</span></span>(<span class="code_string">"' + work.info.title + '"</span>)</h2>\
					\
					<h3>' + work.info.subtitle + ' <div class="year">' + work.year + '</div></h3>\
					<div class="icons">\
						' + icons + '\
					</div>\
					<div class="links">\
						' + links + '\
					</div>\
					<div class="description">' + work.info.description + '</div>\
					<div class="files">\
						' + files + '\
					</div>\
				</div>' +
				(additional_work ? '<div class="more">\
					<h2>print <span class="code_custom">moreWorks</span>()<span id="carret" class="code_carret">&nbsp;</span></h2>\
					<div id="portfolio" style="margin-top: 20px">\
						<a class="work highlighted" href="/' + (lang === "ru" ? "ru/" : "") + 'portfolio/' + additional_work.year + '-' + additional_work.number + '-' + additional_work.name + '">\
							<div class="logo">\
								<div class="bg" style="background-color: ' + additional_work.info.logo + '; background-image: url(/_images/catalog/' + additional_work.year + '-' + additional_work.number + '-logo.png)"></div>\
								<div class="number" style="color: ' + (additional_work.info.logo ? 'transparent' : 'black') + '">' + additional_work.number + '</div>\
							</div>\
							<div class="year">' + additional_work.year + '</div>\
							<div class="info">\
								<div class="title">' + additional_work.info.title + '</div>\
								<div class="subtitle">' + (additional_work && additional_work.info && additional_work.info.subtitle ? additional_work.info.subtitle : "N/A") + '</div>\
							</div>\
						</a>\
					</div>\
				</div>' : ''))

			if(lang === "ru") {
				html = html.replace(new RegExp("<!-- TAGS -->", "g"), '\
				<!-- Primary Meta Tags -->\
				<title>ALEKSAI Работы — ' + work.info.title + ' — ' + work.info.subtitle + '</title>\
				<meta name="title" content="ALEKSAI Работы — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta name="description" content="' + work.info.description + '">\
				\
				<!-- Open Graph / Facebook -->\
				<meta property="og:type" content="website">\
				<meta property="og:url" content="https://aleksai.dev/ru/portfolio/' + work.year + '-' + work.number + '-' + work.name + '">\
				<meta property="og:title" content="ALEKSAI Работы — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta property="og:description" content="' + work.info.description + '">\
				<meta property="og:image" content="https://aleksai.dev/_images/logo.png">\
				\
				<!-- Twitter -->\
				<meta property="twitter:card" content="summary_large_image">\
				<meta property="twitter:url" content="https://aleksai.dev/ru/portfolio/' + work.year + '-' + work.number + '-' + work.name + '">\
				<meta property="twitter:title" content="ALEKSAI Работы — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta property="twitter:description" content="' + work.info.description + '">\
				<meta property="twitter:image" content="https://aleksai.dev/_images/logo.png">')
			} else {
				html = html.replace(new RegExp("<!-- TAGS -->", "g"), '\
				<!-- Primary Meta Tags -->\
				<title>ALEKSAI Portfolio — ' + work.info.title + ' — ' + work.info.subtitle + '</title>\
				<meta name="title" content="ALEKSAI Portfolio — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta name="description" content="' + work.info.description + '">\
				\
				<!-- Open Graph / Facebook -->\
				<meta property="og:type" content="website">\
				<meta property="og:url" content="https://aleksai.dev/portfolio/' + work.year + '-' + work.number + '-' + work.name + '">\
				<meta property="og:title" content="ALEKSAI Portfolio — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta property="og:description" content="' + work.info.description + '">\
				<meta property="og:image" content="https://aleksai.dev/_images/logo.png">\
				\
				<!-- Twitter -->\
				<meta property="twitter:card" content="summary_large_image">\
				<meta property="twitter:url" content="https://aleksai.dev/portfolio/' + work.year + '-' + work.number + '-' + work.name + '">\
				<meta property="twitter:title" content="ALEKSAI Portfolio — ' + work.info.title + ' — ' + work.info.subtitle + '">\
				<meta property="twitter:description" content="' + work.info.description + '">\
				<meta property="twitter:image" content="https://aleksai.dev/_images/logo.png">')
			}

			res.send(html)
		})
	}

}