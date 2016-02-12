
	// Open the welcome page on install
	chrome.runtime.onInstalled.addListener(function (details) {
		if ( details.reason === "install" ) {
			
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
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
		    
		}
	});
    
    // reload all instanes of Gmail
    chrome.tabs.query({ url: "https://mail.google.com/*"}, function ( tabs ) {
    	tabs.forEach( function ( tab ) {
    		chrome.tabs.reload( tab.id );
    	});
    });

	// set up the open welcome page listener. and get sender data
	chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message === 'open_welcome_page' ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
		} else if ( message === 'get_sender_data' ) {
			chrome.identity.getProfileUserInfo( function ( info ) {
				callback({
					sender_name: "",
					sender_email: info.email
				});
			});
        } else if ( message.name === 'WebAudioRecorderWrap.get_frequency_data' ){
            // ignore
        } else{
            console.info({ source: 'background.js', req: message, sender: sender });            
        }
        
		return true;
	});

	var web_audio_recorder_wrap = new WebAudioRecorderWrap( chrome, window.navigator, WebAudioRecorder, AudioContext, "/js/lib/WebAudioRecorder/" );

	( function set_up_popup_controller ( window, jQuery ) {
		chrome.identity.getProfileUserInfo( function ( info ) {
			window.popup_controller = new PopupController(
				web_audio_recorder_wrap,
				new Uploader( jQuery.ajax, {
					sender_name: "",
					sender_email: info.email
				}),
				jQuery,
				new EventHub(),
				new TranscriptionManager( jQuery, window.navigator.language )
			);
		});
	} ( window, jQuery ) );

	( function set_up_gmail_recorder ( chrome ) {

		window.background_recorder = new BackgroundRecorder(
			chrome.runtime,
			web_audio_recorder_wrap,
			new TranscriptionManager( jQuery, window.navigator.language )
		);

	} ( chrome) );
    	
    ( function set_up_background_uploader ( jQuery, chrome ) {
		chrome.identity.getProfileUserInfo( function ( info ) {
			window.background_uploader = new BackgroundUploader(
				jQuery,
                chrome,
				new Uploader( jQuery.ajax, {
					sender_name: "",
					sender_email: info.email
				})
			);
		});
	} ( jQuery, chrome ) );