
    var utilities, event_hub, analytics;
    
    var storage_defaults = {
        compose_button_has_been_used: false,
        browser_action_tooltip_has_been_shown: false,
        browser_action_popup_has_been_opened: false,
        log_level: 'error'
    };
        
    var options_defaults = {
        disable_reply_button: false,
        enable_immediate_insert: true,
        transcription_language : window.navigator.language
    };
        
    ( function set_up_utilities ( chrome, $ ) {
		
        utilities = new Utilities( chrome, $, 'background' );
		
	} ( chrome, jQuery ) );
    
    ( function set_up_event_hub ( ) {
		
        event_hub = new EventHub( null, utilities );
		
	} ( ) );
    
    ( function set_up_analytics ( ) {
		
        analytics = new AnalyticsManager( 'background', event_hub, utilities );
		
	} ( ) );

    ( function constructor () {
        
        event_hub.fire( 'class_load', { name : 'background' } );
    
    } () );
    
	// Open the welcome page on install
	chrome.runtime.onInstalled.addListener(function (details) {
		
		if ( details.reason === "install" ) {
            
		    chrome.tabs.create({
		        url: chrome.extension.getURL("/pages/welcome_page/welcome.html"),
		        active: true
		    });
            
            event_hub.fire( 'setup', { name : 'install' } );
		    
		}

		// set up storage defaults
		chrome.storage.local.set(storage_defaults);
        
        event_hub.fire( 'setup', { name : 'storage_defaults', storage_defaults } );
        
	});

	// set up options defaults
    chrome.storage.local.set({ options_data: options_defaults });
    event_hub.fire( 'setup', { name : 'options_defaults', options_defaults } );
    
    // reload all instances of Gmail
    chrome.tabs.query({ url: "https://mail.google.com/*" }, function ( tabs ) {
    	tabs.forEach( function ( tab ) {
    		chrome.tabs.reload( tab.id );
            
            event_hub.fire( 'page_load', { name: 'gmail', tab_id: tab.id } );            
    	});
    });

	// set up the open welcome page listener. and get sender data
	chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message === 'open_welcome_page' ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
            
            event_hub.fire( 'page_load', { name: 'welcome' } );
                        
		} else if ( message === 'get_sender_data' ) {
			chrome.identity.getProfileUserInfo( function ( info ) {
				callback({
					sender_name: "",
					sender_email: info.email
				});
			});
        }
        
	});
    
    // send any analytics logged from content scripts
    chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

		if ( message.name === 'track_analytic' ) {            
		    analytics.track( message.val, false, callback );
		}
        
	});
    
    var known_messages = ['open_welcome_page','get_sender_data','WebAudioRecorderWrap.get_frequency_data','page_alert','peppermint-messaging-test','track_analytic'];
    
    // log all unhandled messages
    chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

        if ( $.inArray(message, known_messages) < 0 && $.inArray(message.name, known_messages) < 0 )
        {
		    console.info({ 
                info: 'unhandled message', source: 'background.js', message, sender 
            });
        }
        
	});

	var web_audio_recorder_wrap = new WebAudioRecorderWrap( chrome, window.navigator, WebAudioRecorder, AudioContext, "/js/lib/WebAudioRecorder/", utilities, event_hub );

	( function set_up_popup_controller ( window, chrome, jQuery ) {
		chrome.identity.getProfileUserInfo( function ( info ) {
			chrome.storage.local.get( null, function ( items ) {

				var event_hub = new EventHub();

				new ErrorReporter( event_hub );

				window.popup_controller = new PopupController(
                    chrome,
					web_audio_recorder_wrap,
					new Uploader( jQuery.ajax, {
						sender_name: "",
						sender_email: info.email
					}, utilities, event_hub),
					jQuery,
					event_hub,
					new TranscriptionManager( jQuery, items.options_data.transcription_language, utilities, event_hub ),
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
				new TranscriptionManager( jQuery, items.options_data.transcription_language, utilities, event_hub ),
                utilities,
                event_hub
			);

		});
	} ( chrome) );
    	
    ( function set_up_background_uploader ( jQuery, chrome ) {
		chrome.identity.getProfileUserInfo( function ( info ) {            
			window.background_uploader = new BackgroundUploader(
				jQuery,
                chrome,
                utilities,
                event_hub,
				new Uploader( jQuery.ajax, {
					sender_name: "",
					sender_email: info.email
				}, utilities, event_hub ),
                new ContentRecorder( chrome.runtime, event_hub, utilities )
			);
		});
	} ( jQuery, chrome ) );
    