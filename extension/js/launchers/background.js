
	( function general_setup () {

		var install_storage_defaults = {

			compose_button_has_been_used: false,
			browser_action_tooltip_has_been_shown: false,
			browser_action_popup_has_been_opened: false,
			log_level: 'error',
			prod_id: "mphcafiedeanpmilmmlcjhkcgddphicp",
			current_id: chrome.i18n.getMessage( '@@extension_id' )

		};

		var reload_storage_defaults = {

			options_data: {
				disable_reply_button: false,
				enable_immediate_insert: true,
				transcription_language : window.navigator.language,
			},
			recording_in_popup: false,
			popup_state: {},
			recording_data_arr: []

		};
			
		var utilities = new Utilities( chrome, $, 'background' );
		var event_hub = new EventHub( null, utilities );
		var analytics = new AnalyticsManager( 'background', event_hub, utilities );
			
		// Open the welcome page on install
		chrome.runtime.onInstalled.addListener( function ( details ) {
			
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
					upload_queue,
					uploader
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

		( function set_up_global_storage () {

			new GlobalStorage(
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

	( function spike_code_for_blinking_browser_action () { 

		var period = 1000;
		var big_black = $( "<img src = '/img/browser_action_icons/big_black.png' >" )[ 0 ];
		var big_transp = $( "<img src = '/img/browser_action_icons/big_transp.png' >" )[ 0 ];

		function get_image_data ( big_black, big_transp, percentage ) {

			var canvas = document.createElement( "canvas" );
			canvas.width = 38;
			canvas.height = 38;
			var ctx = canvas.getContext( "2d" );
			
			ctx.fillStyle = "hsl( 176, 100%, 38% )";
			ctx.fillRect( 0, 0, 38, 38 );
			
			ctx.fillStyle = "rgba( 121, 121, 121, A )".replace( "A", percentage );
			ctx.fillRect( 0, 0, 38, 38 );
			
			ctx.globalCompositeOperation = "destination-out";

			ctx.drawImage( big_black, 0, 0 );

			ctx.globalCompositeOperation = "source-over";
			
			ctx.drawImage( big_transp, 0, 0 );

			return ctx.getImageData( 0, 0, 38, 38 );

		};

		( function tick () {
			
			chrome.storage.local.get( [ "recording_in_popup" ], function ( items ) {

				if ( items.recording_in_popup ) {

					var image_data = get_image_data(
						big_black,
						big_transp,
						( 1 + Math.cos( Math.PI * Date.now() / period ) ) / 2
					);

					chrome.browserAction.setIcon({ imageData: image_data });
			
				} else {

					chrome.browserAction.setIcon({ path: "/img/browser_action_icons/standart.png" });

				}
			
				setTimeout( tick, 20 );

			});

		} () )

	} () );