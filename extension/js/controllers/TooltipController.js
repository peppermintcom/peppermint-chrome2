
	function TooltipController ( chrome, $, hub, browser_action_tooltip, compose_button_tooltip ) {

		var state = {

		};

		var private = {

			browser_action_tooltip_should_be_inserted: function () {

				return new Promise( function ( resolve ) {

					chrome.storage.local.get( null, function ( items ) {

						var flag_1 = items[ "browser_action_popup_has_been_opened" ];
						var flag_2 = items[ "browser_action_tooltip_has_been_shown" ];

						if ( !flag_1 && !flag_2 ) {

							resolve( true );

						} else {

							resolve( false );

						}

					});

				});

			},

			compose_button_tooltip_should_be_inserted: function () {

				return new Promise( function ( resolve ) {

					chrome.storage.local.get( null, function ( items ) {

						var flag_1 = items[ "compose_button_has_been_used" ];

						if ( !flag_1 && location.host.indexOf( "mail.google.com" ) >= -1  ) {

							resolve( true );

						} else {

							resolve( false );

						}

					});

				});

			}

		};

		var public = {

		};

		( function () {

			private.browser_action_tooltip_should_be_inserted()
			.then( function ( flag ) {

				if ( flag ) {

					$( browser_action_tooltip ).show();
					chrome.storage.local.set({ browser_action_tooltip_has_been_shown: true });

					( function timeout () {

						chrome.storage.local.get( [ "browser_action_popup_has_been_opened" ], function ( items ) {
						
							if ( items[ "browser_action_popup_has_been_opened" ] ) {
							
								browser_action_tooltip.remove();
							
							} else {

								setTimeout( timeout, 100 );

							}

						});

					} () )

				} else {

					browser_action_tooltip.remove();

				}

			});

			private.compose_button_tooltip_should_be_inserted()
			.then( function ( flag ) {

				if ( flag ) {

					$( compose_button_tooltip ).show();
					compose_button_tooltip.stick_to( "#peppermint_compose_button" );
					chrome.storage.local.set({ compose_button_tooltip_has_been_shown: true });

					( function timeout () {

						chrome.storage.local.get( [ "compose_button_has_been_used" ], function ( items ) {
						
							if ( items[ "compose_button_has_been_used" ] ) {
							
								compose_button_tooltip.remove();
							
							} else {

								setTimeout( timeout, 100 );

							}

						});

					} () )

				} else {

					compose_button_tooltip.remove()
					
				}

			});



		} () )

		return public;

	};