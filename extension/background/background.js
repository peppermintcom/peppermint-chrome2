
chrome.runtime.onInstalled.addListener(function (details) {
	if ( details.reason === "install" ) {
	    chrome.tabs.create({
	        url: chrome.extension.getURL("welcome_page/welcome.html"),
	        active: true
	    });
	}
});

chrome.storage.sync.get(null, function(items) {
	var dataToGetApiKey, apiKey;
	if ( !items.apiData ) {
		dataToGetApiKey = {
			api_key: "abc123",
			recorder: {
				description: "chrome app"
			}
		};

		makeRequest("POST", "recorder", dataToGetApiKey, null, function (res) {
		    chrome.storage.sync.set({"apiData": res}, function() {
		    	console.log("apiData saved");
		    });
		});
	}
});

function makeRequest(method, url, data, header, callback) {
	var baseUrl = "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/";
	var ajax = new XMLHttpRequest();
	var json = data ? JSON.stringify(data) : null;
	ajax.onreadystatechange = function() {
		if ( ajax.readyState === XMLHttpRequest.DONE ) {
			if ( ajax.status === 201 ) {
				callback(JSON.parse(ajax.responseText));
			}else {
				console.log(ajax.responseText);
			}
		}
	};
	ajax.open(method, baseUrl + url);
	if ( header ) {
		ajax.setRequestHeader("Content-Type", "application/json");
		ajax.setRequestHeader("Authorization", header.value);
	}
	ajax.send(json);
}
