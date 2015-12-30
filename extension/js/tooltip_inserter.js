
	( function () {
		
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

			container.innerHTML = "<div id = 'peppermint_tooltip_top' class = 'top' ></div>";

			document.body.appendChild( container );

		};

		function id_to_template ( id ) {
			return $( "#" + id )[0].import.querySelector( "template" );
		};

		function url ( url ) {
			return chrome.extension.getURL( url );
		};

		chrome.storage.local.get( null, function ( items ) {

			if ( !items["browser_action_tooltip_has_been_shown"] ) {

				chrome.storage.local.set({ browser_action_tooltip_has_been_shown: true });

				insert_imports([
					[ '-tooltip-', '/templates/tooltip.html' ]
				])
				.then( function () {

					add_elements();

					var event_hub = new EventHub();

					var tooltip = new Tooltip( jQuery, id_to_template( "-tooltip-" ), $( "#peppermint_tooltip_top" )[0], url("/img"), event_hub );
					$( tooltip ).show();

					if ( window.innerWidth > document.body.clientWidth ) {
						tooltip.classList.add( "shifted_pointer" );
					};

					var interval = setInterval( function () {
						chrome.storage.local.get( [ "browser_action_popup_has_been_opened" ], function ( items ) {
							if ( items[ "browser_action_popup_has_been_opened" ] ) {
								clearInterval( interval );
								$( tooltip ).hide();
							}
						});
					}, 100 );

					chrome.runtime.onMessage.addListener( function listener ( message ) {

						if ( message === "browser_action_popup_opened" ) {
							$( tooltip ).hide();
							chrome.runtime.onMessage.removeListener( listener );							
						}

					});

					event_hub.add({

						"tooltip_close_button_click": function () {

							$( tooltip ).hide();

						}

					});

				});

			}

		});

	} () )