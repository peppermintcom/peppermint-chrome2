
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'tooltip', 'html/elements/tooltip.html' ]

		]).then( function ( t ) {

			function add_elements () {

				var container = document.createElement( "div" );

				container.innerHTML = "<div id = 'peppermint_tooltip_top' class = 'top' ></div>";

				document.body.appendChild( container );

			};

			chrome.storage.local.get( null, function ( items ) {

				if ( !items["browser_action_tooltip_has_been_shown"] ) {

					chrome.storage.local.set({ browser_action_tooltip_has_been_shown: true });

					add_elements();

					var event_hub = new EventHub();

					var tooltip = new Tooltip( jQuery, event_hub, t["tooltip"], $( "#peppermint_tooltip_top" )[0] );
					$( tooltip ).show();

					if ( window.innerWidth > document.body.clientWidth ) {
						tooltip.classList.add( "shifted_pointer" );
					};

					setTimeout( function timeout () {
						
						chrome.storage.local.get( [ "browser_action_popup_has_been_opened" ], function ( items ) {
						
							if ( items[ "browser_action_popup_has_been_opened" ] ) {
							
								$( tooltip ).hide();
							
							} else {

								setTimeout( timeout, 100 );

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

				}

			});

		});

	} () )