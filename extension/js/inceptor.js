
	( function ( $, chrome, document ) {
		
		function insert_imports( imports ) {
			
			return new Promise( function ( resolve ) {

				if ( imports.length === 0 ) {

					resolve();

				} else {

					var template_import = imports.pop();

					var link = document.createElement( 'link' );
					link.rel = 'import';
					link.id = template_import[0];
					link.href = chrome.extension.getURL( template_import[1] );
					link.onload = function () {
						insert_imports( imports )
						.then( resolve );
					};

					document.head.appendChild( link );

				}

			});
			
		};

		function add_elements () {

			var container = document.createElement( "div" );

			container.innerHTML = "\
				<div id = 'peppermint_mini_popup' >\
					<div class = 'player' id = 'peppermint_mini_popup_player' ></div>\
				</div>\
				<div id = 'peppermint_popup' >\
					<div class = 'player'	id = 'peppermint_popup_player'	></div>\
					<div class = 'timer'	id = 'peppermint_timer'			></div>\
				</div>\
				<div id = 'peppermint_button_inserter' ></div>";

			document.body.appendChild( container );

		};

		function id_to_template ( id ) {
			return $( "#" + id )[0].import.querySelector( "template" );
		};

		function url ( url ) {
			return chrome.extension.getURL( url );
		};

		insert_imports([
			[	'v-popup-import',			'/templates/v-popup.html'			],
			[	'v-timer-import',			'/templates/v-timer.html'			],
			[	'v-player-import',			'/templates/v-player.html'			],
			[	'v-mini-popup-import',		'/templates/v-mini-popup.html'		],
			[	'v-button-inserter-import',	'/templates/v-button-inserter.html'	]
		])
		.then( function () {

			add_elements();
		
			new Popup( jQuery, id_to_template( "v-popup-import" ), $( "#peppermint_popup" )[0], url("/img") );
			new Timer( jQuery, id_to_template( "v-timer-import" ), $( "#peppermint_timer" )[0], url("/img") );
			new Player( jQuery, id_to_template( "v-player-import" ), $( "#peppermint_popup_player" )[0], url("/img") );
			new Player( jQuery, id_to_template( "v-player-import" ), $( "#peppermint_mini_popup_player" )[0], url("/img") );
			new MiniPopup( jQuery, id_to_template( "v-mini-popup-import" ), $( "#peppermint_mini_popup" )[0], url("/img") );
			new ButtonInserter( jQuery, true, id_to_template( "v-button-inserter-import" ), $( "#peppermint_button_inserter" )[0], url("/img") );

			new GmailController(
				new ContentRecorder( chrome.runtime ),
				new Uploader( jQuery.ajax ),
				new EventHub(),
				chrome,
				new LetterManager( jQuery, document ),
				jQuery
			);

		});

	} ( jQuery, chrome, document ) );

