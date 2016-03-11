
	( function ( $, chrome, utilities ) {
		
        function add_metric ( metric, log_result ){
            
            if(!utilities)
                utilities = new Utilities( chrome, $, 'options' );
                
            utilities.add_metric( metric, function ( result ) {
                if(log_result)
                    console.log({ metric, result });
            });
        }
        
		chrome.storage.local.get( null, function ( items ) {
			
			var browser_language = window.navigator.language;
			var extension_transcription_language = null;
			
			console.log( "extension transcription enable_immediate_insert: " + items["options_data"]["enable_immediate_insert"] );
			console.log( "extension transcription disable_reply_button: " + items["options_data"]["disable_reply_button"] );
			
			console.log( "browser language: " + browser_language);
			console.log( "extension transcription langauge: " + items["options_data"]["transcription_language"] );

			$("#ennable_immediate_insert")[0].checked = items["options_data"]["enable_immediate_insert"];
			$("#disable_reply_button")[0].checked = items["options_data"]["disable_reply_button"];
			
			extension_transcription_language = (("transcription_language" in items["options_data"]))? items["options_data"]["transcription_language"] : browser_language;
			$('#transcription_language').val(extension_transcription_language);

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
		
		$('#transcription_language').change(function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.transcription_language = event.target.options[event.target.selectedIndex].value;
				chrome.storage.local.set({ options_data: items.options_data });
			
			});

		});
        
        ( function constructor () {
    
            private.add_metric({ name: 'class-load', val: { class: 'options' } });

        } () );

	} ( jQuery, chrome ) );
