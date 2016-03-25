	
	function Storage ( chrome ) {
		
		var state = {

		};

		var private = {

			id_and_arr_to_index: function ( id, arr ) {

				for ( var i = arr.length; i--; ) {

					if ( arr[ i ].id === id ) return i;

				}

			}

		};

		var public = {

			id_to_recording_data: function ( id ) {

				return new Promise( function ( resolve ) {

					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						resolve(
							items.recording_data_arr[
								private.id_and_arr_to_index( id, items.recording_data_arr )
							]
						);

					});

				});

			},

			get_last_recording_data_by_source_name: function ( source_name ) {
		
				return new Promise( function ( resolve ) {

					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						var recording_data = false;

						for ( var i = items.recording_data_arr.length; i-- ; ) {

							if ( items.recording_data_arr[ i ].source.name === source_name ) {

								recording_data = items.recording_data_arr[ i ];
								break;

							};

						};

						resolve( recording_data );

					});

				});

			},

			save_recording_data: function ( recording_data ) {

				chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

					items.recording_data_arr.push( recording_data );
					chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });

				});

			},

			update_recording_data: function ( recording_data ) {

				chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

					var index = private.id_and_arr_to_index( recording_data.id, items.recording_data_arr );
					$.extend( true, items.recording_data_arr[ index ], recording_data );
					chrome.storage.local.set({ recording_data_arr: items.recording_data_arr });

				});

			},

			get_recording_data_arr: function () {

				return new Promise ( function ( resolve ) {

					chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

						resolve( items.recording_data_arr );

					});

				});

			},

			delete_recording_data: function ( id ) {

				chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

					var index = private.id_and_arr_to_index( id, items.recording_data_arr );
					items.recording_data_arr.splice( index, 1 );
					chrome.storage.local.set( items );

				});

			},

			delete_transcription: function ( id ) {

				chrome.storage.local.get( [ "recording_data_arr" ], function ( items ) {

					var index = private.id_and_arr_to_index( id, items.recording_data_arr );
					items.recording_data_arr[ index ].transcription_data.text = "";
					chrome.storage.local.set( items );

				});

			}

		};

		return public;

	}
