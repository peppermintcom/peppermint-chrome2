
	( function general_setup () {

		new ErrorReporter( chrome, $, 'background' );

		var install_storage_defaults = {

			compose_button_has_been_used: false,
			browser_action_tooltip_has_been_shown: false,
			browser_action_popup_has_been_opened: false,
			log_level: 'error',
			recording_data_arr: [],
			prod_id: "mphcafiedeanpmilmmlcjhkcgddphicp",
			current_id: chrome.runtime.id

		};

		var reload_storage_defaults = {

			options_data: {
				disable_reply_button: false,
				enable_immediate_insert: true,
				transcription_language : window.navigator.language,
			}

		};

		var analytics = new GlobalAnalytics( chrome, $ );
			
		// Open the welcome page on install
		chrome.runtime.onInstalled.addListener( function ( details ) {
			
			if ( details.reason === "install" ) {
				
				chrome.tabs.create({
					url: chrome.extension.getURL("/pages/welcome_page/welcome.html"),
					active: true
				});

				// set up storage defaults
				chrome.storage.local.set( install_storage_defaults );
				
				analytics.add_to_send_queue( { name: 'setup', val: { source: 'background', name : 'install' } } );

				analytics.add_to_send_queue( { name: 'setup', val: { source: 'background', name : 'storage_defaults', install_storage_defaults } } );

			}
			
		});

		// set up defaults
		chrome.storage.local.set( reload_storage_defaults );
		
		// reload all instances of Gmail
		chrome.tabs.query({ url: [ "https://mail.google.com/*", "https://app.asana.com/*", "https://*.slack.com/*", "https://*.tumblr.com/*" ] }, function ( tabs ) {
			tabs.forEach( function ( tab ) {
				chrome.tabs.reload( tab.id );
			});
		});
	
 	} () );

	( function set_up_background_helper () {

		new BackgroundHelper(
			chrome,
			jQuery
		);

	} () );

	( function set_up_tooltip_manager () {

		new TooltipManager(
			chrome,
			jQuery
		);

	} () );

	( function set_up_global_controller () {

		var event_hub = new EventHub();

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

		var recorder = new Recorder(
			chrome,
			jQuery,
			event_hub,
			web_audio_recorder_wrap,
			transcription_manager
		);

		var uploader = new Uploader(
			chrome,
			jQuery,
			event_hub,
			{
				sender_name: "",
				sender_email: ""
			}
		);

		var upload_queue = new UploadQueue(
			chrome,
			jQuery,
			event_hub,
			uploader
		);

		var storage = new Storage(
			chrome,
			jQuery,
			event_hub
		);

		var backend_manager = new BackendManager(
			jQuery.ajax
		);

		new GlobalController(
			chrome,
			jQuery,
			event_hub,
			recorder,
			uploader,
			upload_queue,
			storage,
			backend_manager
		);

		new BaController(
			chrome,
			jQuery,
			event_hub
		);

		new ContentInserterModule(
			chrome,
			jQuery,
			event_hub
		);

		event_hub.fire( "start" );

	} () );
