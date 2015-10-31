
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

	V.WebRequestManager = function ( chrome, hub ) {

		var obj = {

			enabled: false,

			listener: function ( details ) {

				console.log( details );

				var cancel = false;

				if ( details.url.indexOf("mail.google.com") !== -1 ) {
					if ( details.requestBody !== undefined ) {
						if ( details.requestBody.formData !== undefined ) {
							if (
								details.requestBody.formData.to !== undefined
								&& details.requestBody.formData.subject !== undefined
								&& details.requestBody.formData.body !== undefined
							) {
								cancel = true;
								hub.fire({
									name: "mail_intercepted_1",
									tab_id: details.tabId,
									to: details.requestBody.formData.to,
									subject: details.requestBody.formData.subject[0],
									body: details.requestBody.formData.body[0]
								});
							};
						};
					};
				};

				return {

					cancel: cancel

				};

			}

		};

		return {

			disable_mail: function () {
				if ( !obj.enabled ) {
					chrome.webRequest.onBeforeRequest.addListener(
						obj.listener,
						{
							urls: [ "<all_urls>" ]
						},
						[ "blocking", "requestBody" ]
					);
					obj.enabled = true;
				}
			},

			enable_mail: function () {
				chrome.webRequest.onBeforeRequest.removeListener( obj.listener );
				obj.enabled = false;
			}

		};

	};

	( function ( chrome ) {

		var obj = {};

		obj.hub = new V.EventHub( 'background_hub', { chrome: chrome, window: window });
		obj.web_request_manager = new V.WebRequestManager( chrome, obj.hub );

		obj.hub.add({

			"enable_mail_request_2": function ( data ) {
				obj.web_request_manager.enable_mail();
			},

			"disable_mail_request_2": function ( data ) {
				obj.web_request_manager.disable_mail();
			}

		});

	} ( chrome ) );
