
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'popup', '/html/elements/popup.html' ],
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
				event_hub
			);

		})
		.catch( function ( e ) {

			console.error( e );

		});

	} () );
