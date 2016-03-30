
	( function ( $, chrome ) {

        ( function constructor () {

        	new ErrorReporter( chrome, $, 'options' );

            chrome.runtime.sendMessage( { 
				receiver: 'GlobalAnalytics', name: 'track_analytic', 
				analytic: { name: 'setup', val: { type: 'page_load', name : 'options.js' } } 
			});

        } () );

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

		});

		$("#disable_reply_button").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {

				items.options_data.disable_reply_button = event.target.checked;
				
                chrome.storage.local.set({ options_data: items.options_data });
                
                chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name : 'options',
						action: 'change',
						element_id: '#disable_reply_button', 
						enabled: event.target.checked } } 
				});
			
			});

		});
		
		$("#ennable_immediate_insert").change( function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.enable_immediate_insert = event.target.checked;
                
				chrome.storage.local.set({ options_data: items.options_data });
                
                chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name : 'options',
						action: 'change',
						element_id: '#ennable_immediate_insert', 
						enabled: event.target.checked } } 
				});
			
			});

		});
		
		$('#transcription_language').change(function ( event ) {

			chrome.storage.local.get( null, function ( items ) {
				
				items.options_data.transcription_language = event.target.options[event.target.selectedIndex].value;
                
				chrome.storage.local.set({ options_data: items.options_data });
                
                chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name : 'options',
						action: 'change',
						element_id: '#transcription_language', 
						value: items.options_data.transcription_language } } 
				});
                			
			});

		});
        
	} ( jQuery, chrome ) );
