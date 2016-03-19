	
	function TooltipManager ( chrome, $, event_hub ) {
		
		var state = {
	
		};
	
		var private = {

			tooltip_should_be_inserted: function () {

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
	
			insert_a_tooltip: function ( tab_id ) {

				chrome.tabs.executeScript( tab_id, { file: "/js/lib/jQuery/jquery-2.1.4.min.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/lib/raven.min.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/lib/keen-tracker.min.js" });
				
				chrome.tabs.executeScript( tab_id, { file: "/js/classes/EventHub.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/classes/LauncherHelper.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/elements/Tooltip.js" });
				chrome.tabs.executeScript( tab_id, { file: "/js/launchers/tooltip_content.js" });

				// chrome.tabs.insertCSS( tab_id, { file: "/css/content.css" });

			},

			update_handler: function ( tab_id, change_info, tab ) {

				if ( change_info.status === "complete" && tab.url.indexOf( "chrome://" ) !== 0 ) {

					private.tooltip_should_be_inserted()
					.then( function ( flag ) {

						if ( flag ) {

							private.insert_a_tooltip( tab_id );
							chrome.storage.local.set({ browser_action_tooltip_has_been_shown: true });

						}

					})

				}

			}

		};
	
		chrome.tabs.onUpdated.addListener( private.update_handler )
	
	}
		