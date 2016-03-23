	
	function GlobalStorage ( chrome, $, hub ) {
		
		var state = {

		};

		var private = {

			message_handler: function ( message, sender, callback ) {
	
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

							for ( var i = items.recording_data_arr.length; i--; ) {

								if ( items.recording_data_arr[ i ].id === message.recording_data.id ) {

									$.extend( true, items.recording_data_arr[ i ], message.recording_data );
									chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });
									break;

								}

							}

						});

					} else if ( message.name === "save_recording_data" ) {

						chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

							items.recording_data_arr.push( message.recording_data );
							chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });

						});

					} else if ( message.name === "delete_transcription" ) {

						chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

							for ( var i = items.recording_data_arr.length; i--; ) {

								if ( items.recording_data_arr[ i ].id === message.recording_data.id ) {

									items.recording_data_arr[ i ].transcription_data.text = "";
									chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });
									break;

								}

							}

						});

					} else if ( message.name === "get_recording_data_arr" ) {

						chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

							callback( items.recording_data_arr );

						});

					}

					return true;

				}

			}

		};

		hub.add({

			background_message: function ( message ) {

				private.message_handler( message );

			}

		});

		chrome.runtime.onMessage.addListener( private.message_handler );

	}
