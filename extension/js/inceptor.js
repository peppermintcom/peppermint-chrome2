
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
				<div id = 'peppermint_button_inserter' ></div>\
				<div id = 'peppermint_tooltip' class = 'button' ></div>\
				<div id = 'peppermint_tooltip_top' class = 'top' ></div>";

			document.body.appendChild( container );

		};

		function id_to_template ( id ) {
			return $( "#" + id )[0].import.querySelector( "template" );
		};

		function url ( url ) {
			return chrome.extension.getURL( url );
		};

		insert_imports([
			[	'-popup-',				'/templates/popup.html'					],
			[	'-timer-',				'/templates/timer.html'					],
			[	'-player-',				'/templates/player.html'				],
			[	'-tooltip-',			'/templates/tooltip.html'				],
			[	'-mini-popup-',			'/templates/mini-popup.html'			],
			[	'-button-inserter-',	'/templates/button-inserter.html'		]
		])
		.then( function () {

			add_elements();

			var sender_data = {
				sender_name: $("div[aria-label='Account Information'] .gb_jb").text(),
				sender_email: $("div[aria-label='Account Information'] .gb_kb").text()
			};

			var event_hub = new EventHub();

			var tooltip = new Tooltip( jQuery, id_to_template( "-tooltip-" ), $( "#peppermint_tooltip" )[0], url("/img"), event_hub );
			var tooltip_top = new Tooltip( jQuery, id_to_template( "-tooltip-" ), $( "#peppermint_tooltip_top" )[0], url("/img"), event_hub );
			new Popup( jQuery, id_to_template( "-popup-" ), $( "#peppermint_popup" )[0], url("/img"), event_hub );
			new Timer( jQuery, id_to_template( "-timer-" ), $( "#peppermint_timer" )[0], event_hub );
			new Player( jQuery, id_to_template( "-player-" ), $( "#peppermint_popup_player" )[0], url("/img") );
			new Player( jQuery, id_to_template( "-player-" ), $( "#peppermint_mini_popup_player" )[0], url("/img") );
			new MiniPopup( jQuery, id_to_template( "-mini-popup-" ), $( "#peppermint_mini_popup" )[0], url("/img"), event_hub );
			new ButtonInserter( jQuery, true, id_to_template( "-button-inserter-" ), $( "#peppermint_button_inserter" )[0], url("/img"), event_hub );

			new GmailController(
				new ContentRecorder( chrome.runtime, event_hub ),
				new Uploader( jQuery.ajax, sender_data ),
				event_hub,
				chrome,
				new LetterManager( jQuery, document ),
				jQuery,
				tooltip,
				tooltip_top
			);

		});

	} ( jQuery, chrome, document ) );

