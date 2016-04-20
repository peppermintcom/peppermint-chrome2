
	( function constructor () {

		new ErrorReporter( chrome, $, 'popup' );

		chrome.runtime.sendMessage( { 
			receiver: 'GlobalAnalytics', name: 'track_analytic', 
			analytic: { name: 'setup', val: { type: 'page_load', name : 'popup.js' } } 
		});

	} () );
	
	( function set_up_current_section () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'timer', '/html/elements/timer.html' ],
			[ 'player', '/html/elements/player.html' ]

		]).then( function ( t ) {

			var el = function ( id ) { return document.getElementById( id ) };
			var event_hub = new EventHub();

			new Timer( $, event_hub, t["timer"], el("timer") );
			new Player( $, event_hub, t["player"], el("player") );
			new AudioVisualizer( chrome, $, event_hub, el("audio_visualizer") );

			new PopupController(
				chrome,
				jQuery,
				event_hub,
				moment
			);

			event_hub.fire( "start" );

		})
		.catch( function ( e ) {

			Raven.log( 'popup', 'set_up_current_section', '', e );

		});

	} () );

	( function set_up_tabs () {

		$( "nav li" ).on( "click", function ( event ) {

			$( "nav li" ).removeClass( "active" );
			$( event.currentTarget ).addClass( "active" );
			$( "main section" ).removeClass( "active" );
			$( "main section[data-id='ID']".replace( "ID", event.currentTarget.dataset.id ) ).addClass( "active" );

			chrome.runtime.sendMessage( { 
				receiver: 'GlobalAnalytics', name: 'track_analytic', 
				analytic: { name: 'user_action', val: { 
					type: 'click', name : 'popup_tab_click', element: 'popup_page', tab: $(event.target).data('id') 
				} } 
			});

		});

		$( "#history_start_recording" ).on( "click", function () {

			$( "nav li" ).removeClass( "active" );
			$( "nav li[data-id='current']" ).addClass( "active" );
			$( "main section" ).removeClass( "active" );
			$( "main section[data-id='current']" ).addClass( "active" );

		});

	} () );

	( function set_up_history () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'history_item', '/html/elements/history_item.html' ],
			[ 'player', '/html/elements/player.html' ]

		]).then( function ( t ) {

			var el = function ( id ) { return document.getElementById( id ) };
			var event_hub = new EventHub();

			var history_item_factory = new HistoryItemFactory(
				chrome,
				jQuery,
				event_hub,
				HistoryItem,
				t["history_item"],
				Player,
				t["player"]
			); 

			new HistoryController(
				chrome,
				jQuery,
				event_hub,
				history_item_factory
			);

		})
		.catch( function ( e ) {

			Raven.log( 'popup', 'set_up_history', '', e );

		});

	} () );

	( function set_up_options () {

		chrome.storage.local.get( [ "options_data" ], function ( items ) {

			$( "#transcription_language" ).val( items.options_data.transcription_language );
			$( "#disable_reply_button" )[ 0 ].checked = items.options_data.disable_reply_button;

		});

		$( '#transcription_language' ).change( function ( event ) {

			chrome.storage.local.get( [ "options_data" ], function ( items ) {
				
				items.options_data.transcription_language = $( "#transcription_language" ).val();
				chrome.storage.local.set({ options_data: items.options_data });
							
			});

		});

		$( '#disable_reply_button' ).change( function ( event ) {

			chrome.storage.local.get( [ "options_data" ], function ( items ) {
				
				items.options_data.disable_reply_button = $( "#disable_reply_button" )[ 0 ].checked;
				chrome.storage.local.set({ options_data: items.options_data });
							
			});

		});

	} () );

	( function set_up_feedback () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [
			
			[ 'timer', '/html/elements/timer.html' ]

		]).then( function ( t ) {

			var el = function ( id ) { return document.getElementById( id ) };
			var event_hub = new EventHub();

			new AudioVisualizer( chrome, $, event_hub, el("feedback_audio_visualizer") );
			new Timer( $, event_hub, t["timer"], el("feedback_timer") );

			new FeedbackController(
				chrome,
				jQuery,
				event_hub
			);

			event_hub.fire( "start" );

		})
		.catch( function ( e ) {

			Raven.log( 'popup', 'set_up_feedback', '', e );

		});

	} () );

