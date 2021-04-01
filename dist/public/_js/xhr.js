function XHR(url, token, onComplete, onError, method, params) {
	method = method || "GET";
	params = params || "";

	var xhr = new XMLHttpRequest();

	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 300) {
			var data = JSON.parse(xhr.responseText);
			onComplete(data ? data : xhr.responseText);
		} else {
			onError(xhr.responseText);
		}
	};

	xhr.open(method, url, true);

	if(token) xhr.setRequestHeader("Authorization", "Bearer " + token);

	if(method !== "GET") {
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.send(JSON.stringify(params));
	} else {
		xhr.send();
	}

	return function() { xhr.abort(); };
}