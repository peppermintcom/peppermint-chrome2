
	( function () {
		
		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'popup', 'html/elements/popup.html' ],
			[ 'timer', 'html/elements/timer.html' ],
			[ 'player', 'html/elements/player.html' ],
			[ 'tooltip', 'html/elements/tooltip.html' ],
			[ 'mini_popup', 'html/elements/mini_popup.html' ],
			[ 'gmail_elements', 'html/templates/gmail_elements.html' ],
			[ 'button_inserter', 'html/elements/button_inserter.html' ]

		]).then( function ( t ) {
		
		chrome.storage.local.get( null, function ( items ) {

				chrome.runtime.sendMessage( "get_sender_data", function ( sender_data ) {
				
					try {

						var utilities = new Utilities( chrome, $, 'inceptor' );
						var gmail_elements = document.importNode( t["gmail_elements"].content, true );
						var el =  function ( id ) { return gmail_elements.getElementById( id ) };
						var event_hub = new EventHub( null, utilities );
						var tooltip = el("peppermint_tooltip");

						new AnalyticsManager( event_hub );
						new ErrorReporter( event_hub );

						new Tooltip( $, event_hub, t["tooltip"], el("peppermint_tooltip") );
						new AudioVisualizer( chrome, $, event_hub, el("audio_visualizer"), utilities );
						new Popup( $, event_hub, t["popup"], el("peppermint_popup") );
						new Timer( $, event_hub, t["timer"], el("peppermint_timer") );
						new Player( $, event_hub, t["player"], el("peppermint_popup_player") );
						new Player( $, event_hub, t["player"], el("peppermint_mini_popup_player") );
						new MiniPopup( $, event_hub, t["mini_popup"], el("peppermint_mini_popup") );
						new ButtonInserter( chrome, $, event_hub, t["button_inserter"], el("peppermint_button_inserter"), !items["options_data"]["disable_reply_button"] );

						var alerts = new PageAlerts( chrome, $, utilities );
						var content_recorder = new ContentRecorder( chrome.runtime, event_hub );
						var uploader = new Uploader( jQuery.ajax, sender_data, utilities );
						var letter_manager = new LetterManager( $, document, chrome, sender_data, utilities );

						$( document.body ).append( gmail_elements );

						new GmailController(
							chrome,
							jQuery,
							event_hub,
							content_recorder,
							uploader,
							letter_manager,
							tooltip,
							items["options_data"]["enable_immediate_insert"], 
							utilities
						);
						
					} catch ( error ) {

                        Raven.captureException( error ); 
						throw error;

                    }

				});

			});

		});

	} () );
