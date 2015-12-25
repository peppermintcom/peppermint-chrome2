
	( function ( $, chrome ) {
		
		chrome.storage.local.get( null, function ( items ) {

			console.log( items["options_data"]["enable_immediate_insert"] );
			console.log( items["options_data"]["disable_reply_button"] );

			$("#ennable_immediate_insert")[0].checked = items["options_data"]["enable_immediate_insert"];
			$("#disable_reply_button")[0].checked = items["options_data"]["disable_reply_button"];

		});

		$("#disable_reply_button").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {

				items.options_data.disable_reply_button = event.target.checked;
				chrome.storage.local.set({ options_data: items.options_data });
			
			});

		});
		
		$("#ennable_immediate_insert").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.enable_immediate_insert = event.target.checked;
				chrome.storage.local.set({ options_data: items.options_data });
			
			});

		});

	} ( jQuery, chrome ) );
