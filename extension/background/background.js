
	( function ( chrome ) {

		SetUpManager = function ( chrome ) {
			
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

		var obj = {};
		
		obj.set_up_manager = new SetUpManager( chrome );
		
		chrome.runtime.onInstalled.addListener( function () {
			// disabled for development
			// obj.set_up_manager.open_welcome_page();
			obj.set_up_manager.set_up_options();
		});
		
	} ( chrome ) );
	
	
	