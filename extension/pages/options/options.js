
	( function ( $, chrome, utilities, event_hub ) {
		
        var private = {
            
            init: function ( ) {
                
                utilities = new Utilities( chrome, $, 'options_page' );
                event_hub = new EventHub( null, utilities );
            }
            
        };
        
		chrome.storage.local.get( null, function ( items ) {
			
			var extension_transcription_language = null;
			
            var options_data = {
                browser_language: window.navigator.language,
                enable_immediate_insert: items["options_data"]["enable_immediate_insert"],
                disable_reply_button: items["options_data"]["disable_reply_button"],
                transcription_langauge: items["options_data"]["transcription_language"]
            };
            
            extension_transcription_language = $.inArray('transcription_language', items["options_data"])
                ? options_data.transcription_langauge : options_data.browser_language;
                
			$("#ennable_immediate_insert")[0].checked = options_data.enable_immediate_insert;
			$("#disable_reply_button")[0].checked = options_data.disable_reply_button;
			$('#transcription_language').val(extension_transcription_language);
            
            console.log({ 'options_data': options_data });
            
            event_hub.fire( 'setup', { name: 'options_data', type: 'load', data: options_data } );            

		});

		$("#disable_reply_button").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {

				items.options_data.disable_reply_button = event.target.checked;
				
                chrome.storage.local.set({ options_data: items.options_data });
                
                event_hub.fire( 'options_change', { element: '#disable_reply_button', enabled: event.target.checked } );
			
			});

		});
		
		$("#ennable_immediate_insert").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.enable_immediate_insert = event.target.checked;
                
				chrome.storage.local.set({ options_data: items.options_data });
                
                event_hub.fire( 'options_change', { element: '#ennable_immediate_insert', enabled: event.target.checked } );
			
			});

		});
		
		$('#transcription_language').change(function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.transcription_language = event.target.options[event.target.selectedIndex].value;
                
				chrome.storage.local.set({ options_data: items.options_data });
                
                event_hub.fire( 'options_change', { element: '#transcription_language', value: items.options_data.transcription_language } );
                			
			});

		});
        
        ( function constructor () {
            
            private.init();
            
            event_hub.fire( 'class_load', { name: 'options_page' } );

        } () );

	} ( jQuery, chrome ) );
