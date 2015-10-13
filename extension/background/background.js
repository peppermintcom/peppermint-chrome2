
	V.SetUpManager = function ( chrome ) {
		
		var obj = {
			
			set_up_options: function () {
				chrome.storage.local.set({
					"options_data": {
						"reply_button_disabled": false
					}
				});
			}
			
		};
		
		return {
			
			open_welcome_page: function () {
				chrome.tabs.create({
					url: chrome.extension.getURL("welcome_page/welcome.html"),
					active: true
				});
			},
			
			set_up_options: function () {
				obj.set_up_options();
			}
			
		};
		
	};
	
	V.WebRequestManager = function ( chrome, hub ) {
		
		var obj = {
			
			request_is_mail: function ( details ) {
				if ( details.url.indexOf("autosave=1") === -1 ) {
					if ( details.url.indexOf("mail.google.com") !== -1 ) {
						if ( details.requestBody !== undefined ) {
							if ( details.requestBody.formData !== undefined ) {
								if (
									details.requestBody.formData.to !== undefined
									&& details.requestBody.formData.subject !== undefined
									&& details.requestBody.formData.body !== undefined
								) {
									return true;
								};
							};
						};
					};
				};
				return false;
			},
			
			enabled: false,
			
			listener: function ( details ) {
			
				console.log( details );
				
				var cancel = false;
				
				if ( obj.request_is_mail( details ) ) {
					cancel = true;
					hub.fire({
						name: "mail_intercepted_1",
						tab_id: details.tabId,
						to: details.requestBody.formData.to,
						subject: details.requestBody.formData.subject[0],
						body: details.requestBody.formData.body[0]
					});
				}
				
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
		obj.set_up_manager = new V.SetUpManager( chrome );
		
		chrome.runtime.onInstalled.addListener( function () {
			// disabled for development
			// obj.set_up_manager.open_welcome_page();
			obj.set_up_manager.set_up_options();
		});
		
		obj.hub.add({
			
			"enable_mail_request_2": function ( data ) {
				obj.web_request_manager.enable_mail();
			},
			
			"disable_mail_request_2": function ( data ) {
				obj.web_request_manager.disable_mail();
			}
			
		});
		
	} ( chrome ) );
	
	
	