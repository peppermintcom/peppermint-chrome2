	
	function TooltipManager ( chrome, $, event_hub ) {
		
		var state = {
	
		};
	
		var private = {

			browser_action_tooltip_should_be_inserted: function ( change_info, tab ) {

				return new Promise( function ( resolve ) {

					chrome.storage.local.get( null, function ( items ) {

						var flag_1 = items[ "browser_action_popup_has_been_opened" ];
						var flag_2 = items[ "browser_action_tooltip_has_been_shown" ];

						if ( !flag_1 && !flag_2 && change_info.status === "complete" && tab.url.indexOf( "chrome://" ) !== 0 && tab.url.indexOf( "chrome-extension" ) !== 0 ) {

							resolve( true );

						} else {

							resolve( false );

						}

					});

				});

			},

			compose_button_tooltip_should_be_inserted: function ( change_info, tab ) {

				return new Promise( function ( resolve ) {

					chrome.storage.local.get( null, function ( items ) {

						var flag_1 = items[ "compose_button_has_been_used" ];

						if ( !flag_1 && change_info.status === "complete" && tab.url.indexOf( "mail.google.com" ) > -1  ) {

							resolve( true );

						} else {

							resolve( false );

						}

					});

				});

			},
	
			insert_a_tooltip: function ( tab_id ) {

				chrome.tabs.executeScript( tab_id, { file: "/js/lib/jquery.min.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/lib/raven.min.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/lib/keen-tracker.min.js" });
				
				chrome.tabs.executeScript( tab_id, { file: "/js/shared/EventHub.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/shared/LauncherHelper.js" });

				chrome.tabs.executeScript( tab_id, { file: "/js/int/tooltips/Tooltip.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/int/tooltips/TooltipController.js" });
				
				chrome.tabs.executeScript( tab_id, { file: "/js/int/tooltips/tooltip_content.js" });

				chrome.tabs.insertCSS( tab_id, { file: "/css/content.css" });

			},

			update_handler: function ( tab_id, change_info, tab ) {

				private.browser_action_tooltip_should_be_inserted( change_info, tab )
				.then( function ( flag ) {

					if ( flag ) {

						private.insert_a_tooltip( tab_id );

					}

				});

				private.compose_button_tooltip_should_be_inserted( change_info, tab )
				.then( function ( flag ) {

					if ( flag ) {

						private.insert_a_tooltip( tab_id );

					}

				});

			}

		};
	
		chrome.tabs.onUpdated.addListener( private.update_handler )
	
	}
		