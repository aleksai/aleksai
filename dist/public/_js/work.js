var _carret_timeout;

function init() {
	var carret = document.getElementById("carret");

	carret.classList.remove("hidden");
	if(_carret_timeout) clearTimeout(_carret_timeout);
	_carret_timeout = setTimeout(function() {
		carret.classList.add("hidden");
	}, 2800);
}

addEventListener("load", init);