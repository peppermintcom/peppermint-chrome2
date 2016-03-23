
	( function set_up_current_section () {

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

	( function set_up_tabs () {

		$( "nav li" ).on( "click", function ( event ) {

			$( "nav li" ).removeClass( "active" );
			$( event.currentTarget ).addClass( "active" );
			$( "main section" ).removeClass( "active" );
			$( "main section[data-id='ID']".replace( "ID", event.currentTarget.dataset.id ) ).addClass( "active" );

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

			console.error( e );

		});

	} () );