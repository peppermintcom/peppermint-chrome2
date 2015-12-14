
	( function ( $, chrome, document ) {

		function insert_imports( imports ) {
			return new Promise( function ( resolve ) {

				if ( imports.length === 0 ) {

					resolve();

				} else {

					var import = imports.pop();

					var link = document.createElement( 'link' );
					link.rel = 'import';
					link.id = import[0];
					link.href = 'chrome-extension://' + chrome.runtime.id + '/' + import[1];
					link.onload = function () {
						insert_imports( imports )
						.then( resolve );
					};

					document.head.appendChild( link );

				}

			});
		};

		function add_custom_elements () {

			var container = document.createElement( "div" );

			container.innerHTML = "\
				<v-mini-popup id = 'peppermint_mini_popup' >\
					<v-player id = 'peppermint_mini_popup_player' ></v-player>\
				</v-mini-popup>\
				<v-popup id = 'peppermint_popup' >\
					<v-player id = 'peppermint_popup_player' ></v-player>\
					<v-timer id = 'peppermint_timer ' ></v-timer>\
				</v-popup>";

			document.body.appendChild( container );

		};

		function inject_local_storage () {
			chrome.storage.local.get( null, function ( items ) {
				window.localStorage.peppermint_storage_items = JSON.stringify( items ); 
			});
		};

		function WelcomePageOpener () {

			var public = {

				open: function () {
					chrome.runtime.sendMessage( "open_welcome_page" );
				}

			}

			return public;

		};

			insert_imports([ 
				[ 'v-player-import',		'gmail_content/v-elements/v-player/v-player.html'			],
				[ 'v-timer-import', 		'gmail_content/v-elements/v-timer/v-timer.html'				],
				[ 'v-popup-import', 		'gmail_content/v-elements/v-popup/v-popup.html'				],
				[ 'v-mini-popup-import', 	'gmail_content/v-elements/v-mini-popup/v-mini-popup.html'	]
			])
			.then( function () {
			
				add_custom_elements();


			});

				get_import_inserter( 'v-inceptor', 'gmail_content/inceptor/inceptor.html' )()
				.then( function () {
					var inceptor_import = document.querySelector('#v-inceptor').import;
					inceptor_import.body.innerHTML = inceptor_import.body.innerHTML
					.replace( /{{URL_PREFIX}}/g, chrome.extension.getURL( "/gmail_content/v-elements" ) );
					for ( var i = 0; i < inceptor_import.body.children.length; i++ ) {
						$( document.body ).append( $( inceptor_import.body.children[i] ).clone() );
					}	
				});


	} ( $pmjQuery, chrome, document ) );

