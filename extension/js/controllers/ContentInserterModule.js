	
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

			},

			inserted_tab_id_arr: []

		};

		var proc = {

			execute_scripts( tab_id, scripts_arr ) {

				for ( var i = 0; i < scripts_arr.length; i++ ) {

					chrome.tabs.executeScript( tab_id, {
						file: scripts_arr[ i ],
						runAt: "document_end"
					});

				}

				chrome.tabs.insertCSS( tab_id, {
					
					file: "/css/content.css"

				});

				state.inserted_tab_id_arr.push( tab_id );

			}

		};

		var handle = {

			tab_update: function ( tab_id, change_info, tab ) {
			
				Object.keys( state.integrations ).forEach( function ( key ) {

					if ( state.integrations[ key ].test( change_info.url ) && state.inserted_tab_id_arr.indexOf( tab_id ) === -1 ) {

						proc.execute_scripts( tab_id, state.content_scripts[ key ] );

					}

				});

			}

		};

		( function () {

			chrome.tabs.onUpdated.addListener( handle.tab_update );

		} () )

	}
