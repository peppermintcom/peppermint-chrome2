
    var utilities = new Utilities( chrome, jQuery, 'background' );
    
	// Open the welcome page on install
	chrome.runtime.onInstalled.addListener(function (details) {
		if ( details.reason === "install" ) {
			
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
		    
		}
        
	});

	// set up storage defaults
	chrome.storage.local.set({
		
		compose_button_has_been_used: false,
		browser_action_tooltip_has_been_shown: false,
		browser_action_popup_has_been_opened: false,
		log_level: 'error',
		
		options_data: {
		
			disable_reply_button: false,
			enable_immediate_insert: true,
			transcription_language : window.navigator.language
		
		}
	
	});
    
    // reload all instanes of Gmail
    chrome.tabs.query({ url: "https://mail.google.com/*" }, function ( tabs ) {
    	tabs.forEach( function ( tab ) {
    		chrome.tabs.reload( tab.id );
            utilities.add_metric({ name: 'page-load', val: { page: 'gmail', tab_id: tab.id } });
    	});
    });

	// set up the open welcome page listener. and get sender data
	chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message === 'open_welcome_page' ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
            utilities.add_metric({ name: 'page-load', val: { page: 'welcome' } });
		} else if ( message === 'get_sender_data' ) {
			chrome.identity.getProfileUserInfo( function ( info ) {
				callback({
					sender_name: "",
					sender_email: info.email
				});
			});
        }
        
	});
    
    // send any metrics logged from content scripts
    chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message.name === 'add_metric' ) {            
		    utilities.add_metric( message.val, callback );
		}
        
	});
    
    // log all unhandled messages
    chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message !== 'open_welcome_page' && 
             message !== 'get_sender_data' &&
             message.name !== 'WebAudioRecorderWrap.get_frequency_data' &&
             message.name !== 'page_alert' &&
             message !== 'peppermint-messaging-test' &&
             message.name !== 'add_metric') 
        {
		    console.info({ 
                info: 'unhandled message', source: 'background.js', message, sender 
            });
        }
        
	});
    
	var web_audio_recorder_wrap = new WebAudioRecorderWrap( chrome, window.navigator, WebAudioRecorder, AudioContext, "/js/lib/WebAudioRecorder/", utilities );

	( function set_up_popup_controller ( window, chrome, jQuery ) {
		chrome.identity.getProfileUserInfo( function ( info ) {
			chrome.storage.local.get( null, function ( items ) {

				window.popup_controller = new PopupController(
                    chrome,
					web_audio_recorder_wrap,
					new Uploader( jQuery.ajax, {
						sender_name: "",
						sender_email: info.email
					}),
					jQuery,
					new EventHub(),
					new TranscriptionManager( jQuery, items.options_data.transcription_language ),
                    utilities
				);

			});
		});
	} ( window, chrome, jQuery ) );

	( function set_up_gmail_recorder ( chrome ) {
		chrome.storage.local.get( null, function ( items ) {
		
			window.background_recorder = new BackgroundRecorder(
				chrome.runtime,
				web_audio_recorder_wrap,
				new TranscriptionManager( jQuery, items.options_data.transcription_language ),
                utilities
			);

		});
	} ( chrome) );
    	
    ( function set_up_background_uploader ( jQuery, chrome ) {
		chrome.identity.getProfileUserInfo( function ( info ) {            
			window.background_uploader = new BackgroundUploader(
				jQuery,
                chrome,
                utilities,
				new Uploader( jQuery.ajax, {
					sender_name: "",
					sender_email: info.email
				}),
                new ContentRecorder( chrome.runtime, null )
			);
		});
	} ( jQuery, chrome ) );
    
    utilities.add_metric({ name: 'class-load', val: { class: 'background' } });