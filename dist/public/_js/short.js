function init() {
	var tags = document.getElementById("tags");
	var years = document.getElementById("years");

	if(!tags && !years) return;

	XHR("/catalog.shorts.json", null, function(data) {
		if(data.tags && tags) {
			var html = "";

			for (var i = 0; i < data.tags.length; i++) {
				html += '<a href="#' + data.tags[i] + '">#' + data.tags[i] + '</a> ';
			}

			tags.innerHTML = html;
		}

		if(data.years && years) {
			var html = "";

			for (var i = data.years.length - 1; i >= 0; i--) {
				html += '<a href="' + (tags ? '' : '/portfolio') + '#' + data.years[i] + '">' + data.years[i] + '</a> ';
			}

			years.innerHTML = html;
		}
	}, function(error) {
		console.log(error);
	})
}

addEventListener("load", init);