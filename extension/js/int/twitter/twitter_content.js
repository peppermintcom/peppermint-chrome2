
	console.log( "twitter_content_loaded" );

	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'popup', 'html/elements/popup.html' ],
			[ 'timer', 'html/elements/timer.html' ],
			[ 'player', 'html/elements/player.html' ],
			[ 'gmail_elements', 'html/templates/gmail_elements.html' ],
			[ 'button_inserter', 'html/elements/button_inserter.html' ],
			[ 'recording_button', 'html/elements/recording_button.html' ]

		]).then( function ( t ) {
		
			chrome.storage.local.get( null, function ( items ) {

				chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "get_sender_data" }, function ( sender_data ) {

						var gmail_elements = document.importNode( t["gmail_elements"].content, true );
						var el =  function ( id ) { return gmail_elements.getElementById( id ) };
						var event_hub = new EventHub();

						new AudioVisualizer( chrome, $, event_hub, el("audio_visualizer") );
						new Popup( $, event_hub, t["popup"], el("peppermint_popup") );
						new Timer( $, event_hub, t["timer"], el("peppermint_timer") );
						new Player( $, event_hub, t["player"], el("peppermint_popup_player") );
						new ErrorReporter( chrome, $, 'tumblr' );

						$( document.body ).append( gmail_elements );
		
						setTimeout( function () {

							$( "#peppermint_elements_container" ).css( "display", "block" );

						}, 3000 );

						new TwitterController(
							chrome,
							window,
							jQuery,
							event_hub
						);

						new TwitterButtonInserter(
							chrome,
							window,
							jQuery,
							event_hub
						);
						
						event_hub.fire( "start" );

				});

			});

		});

	} () );

	( function constructor () {
        
        chrome.runtime.sendMessage( { 
			receiver: 'GlobalAnalytics', name: 'track_analytic', 
			analytic: { name: 'setup', val: { type: 'page_load', name : 'tumblr_content.js' } } 
		});

	} () );

