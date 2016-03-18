
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'popup', '/html/elements/popup.html' ],
			[ 'timer', '/html/elements/timer.html' ],
			[ 'player', '/html/elements/player.html' ]

		]).then( function ( t ) {

			var el = function ( id ) { return document.getElementById( id ) };
			var utilities = new Utilities( chrome, $, "popup" );
            var event_hub = new EventHub( null, utilities );
			

			new Timer( $, event_hub, t["timer"], el("timer") );
			new Popup( $, event_hub, t["popup"], el("popup") );
			new Player( $, event_hub, t["player"], el("player") );
			new AudioVisualizer( chrome, $, event_hub, el("audio_visualizer"), utilities );

			chrome.extension.getBackgroundPage().popup_controller.init_popup_state( window.document );
			chrome.extension.getBackgroundPage().popup_controller.register_handlers( window.document, event_hub );

			chrome.storage.local.set({
				"browser_action_popup_has_been_opened": true
			});

		})
		.catch( function ( e ) {

			console.error( e );

		});

	} () );
