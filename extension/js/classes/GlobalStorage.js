	
	function GlobalStorage ( chrome, $, event_hub ) {
		
		var state = {

		};

		var private = {

		};

		var public = {

		};

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.receiver === "GlobalStorage" ) {

				if ( message.name === "get_last_recording_data_by_source" ) {
		
					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						var recording_data = false;

						for ( var i = items.recording_data_arr.length; i-- ; ) {

							if ( items.recording_data_arr[ i ].source === message.source ) {

								recording_data = items.recording_data_arr[ i ];
								break;

							};

						};

						callback( recording_data );

					});

				} else if ( message.name === "update_recording_data" ) {

					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						for ( var i = items.recording_data_arr; i--; ) {

							if ( items.recording_data_arr[ i ].id === message.recording_data.id ) {

								$.extend( true, items.recording_data_arr[ i ], message.recording_data );
								chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });

							}

						}

					});

				} else if ( message.name === "save_recording_data" ) {

					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						items.recording_data_arr.push( message.recording_data );
						chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });

					});

				}

				return true;

			}

		});

		( function () {



		} () )

		return public;

	}
