
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'popup', '/html/elements/popup.html' ],
			[ 'timer', '/html/elements/timer.html' ],
			[ 'player', '/html/elements/player.html' ]

		]).then( function ( t ) {

			var el = function ( id ) { return document.getElementById( id ) };
			var utilities = new Utilities( chrome, $, "popup" );
            var event_hub = new EventHub();

			new Timer( $, event_hub, t["timer"], el("timer") );
			new Popup( $, event_hub, t["popup"], el("popup") );
			new Player( $, event_hub, t["player"], el("player") );
			new AudioVisualizer( chrome, $, event_hub, el("audio_visualizer") );

				chrome.identity.getProfileUserInfo( function ( info ) {
					chrome.storage.local.get( null, function ( items ) {

						new PopupController(
			                chrome,
							jQuery,
							event_hub
						);

					});
				});

			chrome.storage.local.set({
				"browser_action_popup_has_been_opened": true
			});

		})
		.catch( function ( e ) {

			console.error( e );

		});

	} () );
