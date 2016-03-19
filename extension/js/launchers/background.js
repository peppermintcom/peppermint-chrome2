
	( function general_setup () {

		var install_storage_defaults = {

			compose_button_has_been_used: false,
			browser_action_tooltip_has_been_shown: false,
			browser_action_popup_has_been_opened: false,
			log_level: 'error'
		
		};

		var reload_storage_defaults = {

			options_data: {
				disable_reply_button: false,
				enable_immediate_insert: true,
				transcription_language : window.navigator.language
			},
			popup_state: {},
			recording_data_arr: []

		};
			
		var utilities = new Utilities( chrome, $, 'background' );
		var event_hub = new EventHub( null, utilities );
		var analytics = new AnalyticsManager( 'background', event_hub, utilities );
			
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
			chrome.storage.local.set( install_storage_defaults );
			
			event_hub.fire( 'setup', { name : 'storage_defaults', install_storage_defaults } );
			
		});

		// set up defaults
		chrome.storage.local.set( reload_storage_defaults );

		// reload all instances of Gmail
		chrome.tabs.query({ url: "https://mail.google.com/*" }, function ( tabs ) {
			tabs.forEach( function ( tab ) {
				chrome.tabs.reload( tab.id );
			});
		});

		// send any analytics logged from content scripts
	 	chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.name === 'track_analytic' ) {			
				analytics.track( message.val, false, callback );
			}
			
		});
	
 	} () );

	( function set_up_global_modules () {

		var event_hub = new EventHub();

		( function set_up_global_recorder () {

			var web_audio_recorder_wrap = new WebAudioRecorderWrap(
				chrome,
				event_hub,
				window.navigator,
				WebAudioRecorder,
				AudioContext,
				"/js/lib/WebAudioRecorder/"
			);

			var transcription_manager = new TranscriptionManager(
				chrome,
				jQuery,
				event_hub,
				"en-US"
			);

			new GlobalRecorder(
				chrome,
				jQuery,
				event_hub,
				web_audio_recorder_wrap,
				transcription_manager
			);

		} () );

		( function set_up_global_uploader () {
			
			chrome.identity.getProfileUserInfo( function ( info ) {

				var uploader = new Uploader(
					chrome,
					jQuery,
					event_hub,
					{
						sender_name: "",
						sender_email: info.email
					}
				);

				var upload_queue = new UploadQueue(
					chrome,
					jQuery,
					event_hub,
					uploader
				);

				new GlobalUploader(
					chrome,
					jQuery,
					event_hub,
					upload_queue
				);

			});

		} () );

		( function set_up_background_helper () {

			new BackgroundHelper(
				chrome,
				jQuery,
				event_hub
			);

		} () );

		( function set_up_tooltip_manager () {

			new TooltipManager(
				chrome,
				jQuery,
				event_hub
			);

		} () );

	} () );