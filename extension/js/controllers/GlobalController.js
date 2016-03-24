
	function GlobalController ( chrome, $, hub, recorder, uploader, upload_queue, storage ) {

		var state = {

			recording_data: null,
			recording: false
			
		};

		var private = {

			fire: function ( message ) {

				chrome.runtime.sendMessage( message );

				chrome.tabs.query( {}, function ( tabs ) {

					for ( var i = tabs.length; i--; ) {

						chrome.tabs.sendMessage( tabs[ i ].id, message );

					}

				});

			},

			start_recording: function ( source ) {

				recorder.start()
				.then( function ( response ) {

					if ( response.started ) {

						state.recording_data = { id: Date.now(), state: "recording", source };

						storage.save_recording_data( state.recording_data );
						private.fire({ receiver: "Content", name: "recording_started", recording_data: state.recording_data });

					} else {

						private.fire({ receiver: "Content", name: "recording_not_started", source, error: response.error });

					}

				});

			},

			cancel_recording: function () {

				recorder.cancel();
				storage.delete_recording_data( state.recording_data );
				private.fire({ receiver: "Content", name: "recording_canceled", recording_data: state.recording_data });

			},

			finish_recording: function () {

				upload_queue.get_urls_promise()
				.then( function ( urls ) {

					state.recording_data.urls = urls;
					private.fire({ receiver: "Content", name: "got_urls", recording_data: state.recording_data });

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: urls.short_url });

					return recorder.finish();

				})
				.then( function ( data ) {
					
					state.recording_data.data_url = data.data_url;
					state.recording_data.transcription_data = data.transcription_data;
					
					upload_queue.push( state.recording_data );
					upload_queue.kickstart();

					private.fire({ receiver: "Content", name: "got_audio_data", recording_data: state.recording_data });
						
				});

			}

		};

		( function handle_incoming_messages () {

			var runtime_event_handler = {

				start_recording: function ( message ) {

					private.start_recording( message.source );

				},

				cancel_recording: function ( message ) {

					private.cancel_recording();

				},

				finish_recording: function ( message ) {

					private.finish_recording();

				},

				get_last_popup_recording: function ( message, callback ) {

					storage.get_last_recording_data_by_source( "popup" )
					.then( callback );

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "GlobalController" ) {

					if ( runtime_event_handler[ message.name ] ) {

						runtime_event_handler[ message.name ]( message, callback );

					}

				}

			});

		} () );

		( function emit_recording_details () {

			( function tick () {

				var frequency_data = recorder.get_frequency_data();
				var time = recorder.get_time();

				if ( frequency_data || time ) {

					private.fire({
						receiver: "Content",
						name: "recording_details",
						recording_details: {
							frequency_data,
							time
						}
					});

				}

				setTimeout( tick, 20 );

			} () )

		} () );

	}