	
	function ContentInserterModule ( chrome, $, event_hub ) {
		
		var state = {

			integrations: {

				"gmail": /^https:\/\/mail\.google\.com/,
				"asana": /^https:\/\/app\.asana\.com/,
				"slack": /^https:\/\/.+?\.slack\.com/,
				"twitter": /^https:\/\/twitter\.com/,
				"tumblr": /^https:\/\/tumblr\.com/

			},

			content_scripts: {
				
				"gmail": [

					"/js/lib/jQuery/jquery-2.1.4.min.js",
					"/js/lib/raven.min.js",

					"/js/classes/ErrorReporter.js",

					"/js/classes/EventHub.js",
					"/js/classes/LetterManager.js",
					"/js/classes/LauncherHelper.js",
					"/js/classes/ButtonInserter.js",

					"/js/elements/Timer.js",
					"/js/elements/Popup.js",
					"/js/elements/Player.js",
					"/js/elements/Tooltip.js",
					"/js/elements/MiniPopup.js",
					"/js/elements/AudioVisualizer.js",
					"/js/elements/RecordingButton.js",

					"/js/controllers/GmailController.js",

					"/js/launchers/gmail_content.js"
				
				],
				"asana": [

					"/js/lib/jQuery/jquery-2.1.4.min.js",
					"/js/lib/raven.min.js",

					"/js/classes/ErrorReporter.js",
					
					"/js/classes/EventHub.js",
					"/js/classes/LauncherHelper.js",

					"/js/classes/AsanaButtonInserter.js",

					"/js/elements/RecordingButton.js",

					"/js/controllers/AsanaController.js",

					"/js/launchers/asana_content.js"
				
				],
				"slack": [

					"/js/lib/jQuery/jquery-2.1.4.min.js",
					"/js/lib/raven.min.js",

					"/js/classes/ErrorReporter.js",
					
					"/js/classes/EventHub.js",
					"/js/classes/LauncherHelper.js",

					"/js/classes/SlackButtonInserter.js",

					"/js/elements/RecordingButton.js",

					"/js/controllers/SlackController.js",

					"/js/launchers/slack_content.js"

				],
				"twitter": [

					"/js/lib/jQuery/jquery-2.1.4.min.js",
					"/js/lib/raven.min.js",

					"/js/classes/ErrorReporter.js",

					"/js/classes/EventHub.js",
					"/js/classes/LetterManager.js",
					"/js/classes/LauncherHelper.js",

					"/js/elements/Timer.js",
					"/js/elements/Popup.js",
					"/js/elements/Player.js",
					"/js/elements/Tooltip.js",
					"/js/elements/MiniPopup.js",
					"/js/elements/AudioVisualizer.js",
					"/js/elements/RecordingButton.js",

					"/js/controllers/TwitterButtonInserter.js",
					"/js/controllers/TwitterController.js",

					"/js/launchers/twitter_content.js"
				
				],
				"tumblr": [

					"/js/lib/jQuery/jquery-2.1.4.min.js",
					"/js/lib/raven.min.js",

					"/js/classes/ErrorReporter.js",

					"/js/classes/EventHub.js",
					"/js/classes/LauncherHelper.js",
					"/js/classes/TumblrButtonInserter.js",

					"/js/elements/Timer.js",
					"/js/elements/Popup.js",
					"/js/elements/Player.js",
					"/js/elements/Tooltip.js",
					"/js/elements/MiniPopup.js",
					"/js/elements/AudioVisualizer.js",

					"/js/controllers/TumblrController.js",

					"/js/launchers/tumblr_content.js"

				]

			}

		};

		var conv = {

			tab_id_has_injected_script: function ( tab_id ) {

				return new Promise( function ( resolve ) {

					chrome.tabs.sendMessage( tab_id, { receiver: "Content", name: "content_ping" }, resolve );

				});

			}

		};

		var proc = {

			execute_scripts: function ( tab_id, scripts_arr ) {

				return new Promise( function ( resolve ) {

					if ( scripts_arr.length === 0 ) {

						resolve();

					} else {

						var script = scripts_arr.pop();

						proc.execute_scripts( tab_id, scripts_arr )
						.then( function () {

							chrome.tabs.executeScript( tab_id, {
								file: script
							}, resolve );

						});

					}

				});

			}

		};

		var handle = {

			tab_update: function ( tab_id, change_info, tab ) {

				conv.tab_id_has_injected_script( tab_id ).then( function ( has_inj_script ) {
			
					if ( !has_inj_script ) {

						Object.keys( state.integrations ).forEach( function ( key ) {

							if ( state.integrations[ key ].test( tab.url ) ) {

								proc.execute_scripts( tab_id, state.content_scripts[ key ] );

								chrome.tabs.insertCSS( tab_id, {
									
									file: "/css/content.css"

								});

							}

						});

					}

				});

			}

		};

		( function () {

			chrome.tabs.onUpdated.addListener( handle.tab_update );

		} () )

	}
