	
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

			launch_queue_uploading: function () {

				state.queue_is_active = true;

				if ( state.queue.length > 0 ) {

					uploader.upload_recording_data( state.queue[ 0 ] )
					.then( function () {

						state.queue.splice( 0, 1 );
						this.hub.fire( "upload_queue_success" );
						private.launch_queue_uploading();

					})
					.catch( function () {

						state.queue_is_active = true;
						hub.fire( "upload_queue_failed" );

					});

				} else {

					state.queue_is_active = false;

				}

			}

		};

		var public = {

			push: function ( recording_data ) {

				var urls_promise = state.urls_promise;
				state.queue.push( recording_data, urls_promise );

				state.urls_promise = uploader.get_urls_promise( state.token_promise );

				return urls_promise;

			},

			kickstart: function () {

				if ( state.queue_is_active === false ) {

					private.launch_queue_uploading.call( this );
				
				}

			}

		};

		( function () {

			state.token_promise = uploader.get_token_promise();
			state.urls_promise = uploader.get_urls_promise( state.token_promise );

			chrome.alarms.create( "upload_queue_alarm", { periodInMinutes: 2 } );
			chrome.alarms.onAlarm.addListener( alarm_handler );

		} () )

		return public;

	}

