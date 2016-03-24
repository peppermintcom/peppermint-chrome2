	
	function UploadQueue ( chrome, $, hub, uploader ) {
		
		var state = {

			queue: [], // array of recording_data objects
			queue_is_active: false,
			token_promise: undefined,
			urls_promise: undefined
		
		};

		var private = {

			alarm_handler: function ( alarm ) {

				if ( alarm.name = "upload_queue_alarm" ) {

					state.urls_promise = uploader.get_urls_promise( state.token_promise );

					private.launch_queue_uploading();

				}

			},

			try_to_upload_queue_item: function ( item ) {

				uploader.upload_recording_data( item )
				.then( function () {

					state.queue.splice( 0, 1 );
					hub.fire( "upload_queue_success" );
					private.launch_queue_uploading();

					hub.fiire( "recording_data_uploaded", { recording_data: item } );

				})
				.catch( function () {

					state.queue_is_active = false;
					hub.fire( "upload_queue_failed" );

				});

			},

			launch_queue_uploading: function () {

				state.queue_is_active = true;

				if ( state.queue.length > 0 ) {

					if ( state.queue[ 0 ].urls ) {

						private.try_to_upload_queue_item( state.queue[ 0 ] )

					} else {

						state.queue[ 0 ].urls_promise.then( function ( urls ) {

							state.queue[ 0 ].urls = urls;
							private.try_to_upload_queue_item( state.queue[ 0 ] );

						});

					}

				} else {

					state.queue_is_active = false;

				}

			}

		};

		var public = {

			push: function ( recording_data ) {

				if ( recording_data.urls ) {

					state.queue.push( recording_data );
					return recording_data.urls;

				} else {

					var urls_promise = state.urls_promise;
					recording_data.urls_promise = urls_promise;
					state.queue.push( recording_data );

					state.urls_promise = uploader.get_urls_promise( state.token_promise );

					return urls_promise;

				}

			},

			get_urls_promise: function () {

				var urls_promise = state.urls_promise;
				state.urls_promise = uploader.get_urls_promise( state.token_promise );

				return urls_promise;

			},

			kickstart: function () {

				if ( state.queue_is_active === false ) {

					private.launch_queue_uploading();
				
				}

			}

		};

		( function () {

			state.token_promise = uploader.get_token_promise();
			state.urls_promise = uploader.get_urls_promise( state.token_promise );

			chrome.alarms.create( "upload_queue_alarm", { periodInMinutes: 2 } );
			chrome.alarms.onAlarm.addListener( private.alarm_handler );

		} () )

		return public;

	}

