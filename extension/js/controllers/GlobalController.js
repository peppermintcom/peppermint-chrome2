
	function GlobalController ( chrome, $, hub, recorder, uploader, upload_queue, storage ) {

		var state = {

			MAX_RECORDING_TIME: 2 * 1000,

			recording_data: null,
			recording: false
			
		};

		var private = {

			fire: function ( message, source ) {

				if ( source.tab_id ) {

					message.target = source;
					chrome.tabs.sendMessage( source.tab_id, message );

				} else if ( source.tab_id === 0 ) { 
				
					message.target = source;
					chrome.runtime.sendMessage( message );
				
				}

			},

			start_recording: function ( source ) {

				recorder.start()
				.then( function ( response ) {

					if ( response.started ) {

						state.recording_data = { id: Date.now(), state: "recording", source };

						storage.save_recording_data( state.recording_data );
						private.fire( { receiver: "Content", name: "recording_started", recording_data: state.recording_data }, state.recording_data.source );

					} else {

						private.fire( { receiver: "Content", name: "recording_not_started", source, error: response.error }, source );

					}

				});

			},

			cancel_recording: function () {

				recorder.cancel();
				storage.delete_recording_data( state.recording_data );
				private.fire( { receiver: "Content", name: "recording_canceled", recording_data: state.recording_data }, state.recording_data.source );

			},

			finish_recording: function () {

				upload_queue.get_urls_promise()
				.then( function ( urls ) {

					state.recording_data.urls = urls;
					private.fire( { receiver: "Content", name: "got_urls", recording_data: state.recording_data }, state.recording_data.source );

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: urls.short_url });

					return recorder.finish();

				})
				.then( function ( data ) {
					
					state.recording_data.data_url = data.data_url;
					state.recording_data.transcription_data = data.transcription_data;
					state.recording_data.state = "uploading";

					storage.update_recording_data( state.recording_data );

					upload_queue.push( state.recording_data );
					upload_queue.kickstart();

					private.fire( { receiver: "Content", name: "got_audio_data", recording_data: state.recording_data }, state.recording_data.source );
						
				});

			}

		};

		( function handle_incoming_messages () {

			hub.add({

				recording_data_uploaded: function ( data ) {

					console.log( "recording_data_uploaded" );

					data.recording_data.state = "uploaded";
					data.recording_data.data_url = "";

					storage.update_recording_data( data.recording_data );					

				},

				recording_timeout: function () {

					private.finish_recording();
					alert( "Peppermint recording timeout!" );

				}

			});

			var runtime_event_handler = {

				start_recording: function ( message, sender ) {

					message.source.tab_id = sender.tab ? sender.tab.id : 0;
					private.start_recording( message.source );

				},

				cancel_recording: function ( message ) {

					private.cancel_recording();

				},

				finish_recording: function ( message ) {

					private.finish_recording();

				},

				get_last_popup_recording: function ( message, sender, callback ) {

					storage.get_last_recording_data_by_source_name( "popup" )
					.then( callback );

				},

				get_last_popup_feedback_recording: function ( message, sender, callback ) {

					storage.get_last_recording_data_by_source_name( "popup_feedback" )
					.then( callback );

				},

				delete_transcription: function ( message ) {

					uploader.delete_transcription( message.recording_data );
					storage.delete_transcription( message.recording_data );

				},

				get_recording_data_arr: function ( message, sender, callback ) {

					storage.get_recording_data_arr().then( callback );

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "GlobalController" ) {

					if ( runtime_event_handler[ message.name ] ) {

						runtime_event_handler[ message.name ]( message, sender, callback );
						return true;

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
					}, state.recording_data.source );

					if ( time * 1000 > state.MAX_RECORDING_TIME ) {

						hub.fire( "recording_timeout" );

					}

				}

				setTimeout( tick, 20 );

			} () )

		} () );

	}