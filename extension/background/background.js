// temporarily disabled for testing
chrome.runtime.onInstalled.addListener(function (details) {
	if ( details.reason === "install" ) {
	    chrome.tabs.create({
	        url: chrome.extension.getURL("welcome_page/welcome.html"),
	        active: true
	    });
	}
});

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


