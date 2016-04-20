	
	function UploadQueue ( chrome, $, hub, uploader ) {
		
		var state = {

			queue: [], // array of recording_data objects
			queue_is_active: false,
			token_promise: undefined,
			urls: false
		
		};

		var private = {

			alarm_handler: function ( alarm ) {

				if ( alarm.name = "upload_queue_alarm" ) {

					uploader.get_urls_promise( state.token_promise )
					.then( function ( urls ) {
						
						state.urls = urls;

					});

					private.launch_queue_uploading();

				}

			},

			try_to_upload_queue_item: function ( item ) {

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'background_action', val: { 
						name : 'upload_attempt' } } 
				});	

				uploader.upload_recording_data( item )
				.then( function () {

					state.queue.splice( 0, 1 );
					hub.fire( "upload_queue_success" );
					private.launch_queue_uploading();

					hub.fire( "recording_data_uploaded", { id: item.id } );

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'background_action', val: { 
							name : 'upload_success' } } 
					});	

				})
				.catch( function ( error ) {

					state.queue_is_active = false;
					
					Raven.log( 'uploadqueue', 'try_to_upload_queue_item', '', error );
					
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

				state.queue.push( recording_data );

			},

			get_urls: function () {

				var urls = state.urls;
				state.urls = false;

				uploader.get_urls_promise( state.token_promise )
				.then( function ( urls ) {

					state.urls = urls;

				});

				return urls;

			},

			kickstart: function () {

				if ( state.queue_is_active === false ) {

					private.launch_queue_uploading();
				
				}

			}

		};

		( function () {

			state.token_promise = uploader.get_token_promise();
			
			uploader.get_urls_promise( state.token_promise )
			.then( function ( urls ) {
				state.urls = urls;
			});

			chrome.alarms.create( "upload_queue_alarm", { periodInMinutes: 2 } );
			chrome.alarms.onAlarm.addListener( private.alarm_handler );

		} () )

		return public;

	}

