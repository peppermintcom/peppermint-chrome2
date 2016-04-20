	
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
				


			}

		};

		var conv = {

			tab_id_has_injected_script: function ( tab_id ) {

				return new Promise( function ( resolve ) {

					chrome.tabs.sendMessage( tab_id, { receiver: "Content", name: "content_ping" }, resolve );

				});

			},

			url_is_forbidden_for_all_links: function ( url ) {
				
				var regex_1 = /^https:\/\/.+?\.live\.com/;
				var regex_2 = /^https:\/\/.+?\.yahoo\.com/;

				return regex_1.test( url ) || regex_2.test( url );
				
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

				console.log( change_info );

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

				if ( !conv.url_is_forbidden_for_all_links( tab.url ) ) {

					proc.execute_scripts( tab_id, state.content_scripts["all_links"] );

					chrome.tabs.insertCSS( tab_id, {
						file: "/css/all_links_styles.css"
					});

				}

			}

		};

		( function () {

			chrome.tabs.onUpdated.addListener( handle.tab_update );

		} () )

	}
