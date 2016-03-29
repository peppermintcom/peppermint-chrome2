
	function GlobalController ( chrome, $, hub, recorder, uploader, upload_queue, storage, backend_manager ) {

		var MAX_RECORDING_TIME = 5 * 60 * 1000;

		var state = {

			last_recording_ts: 0

		};

		var private = {

			fire: function ( message ) {

				chrome.tabs.query( {}, function ( tabs ) {

					for ( var i = tabs.length; i--; ) {

						chrome.tabs.sendMessage( tabs[ i ].id, message );

					}

				});

				chrome.runtime.sendMessage( message );

				hub.fire( "background_message", message );

			},

			start_recording: function ( source ) {

				var urls = upload_queue.get_urls();

				if ( Date.now() - state.last_recording_ts < 1 * 1000 ) {

					private.fire({ receiver: "Content", name: "recording_not_started", recording_data: { source }, error: { name: 'already_recording' } });
					return;

				}

				if ( urls ) {

					recorder.start()
					.then( function ( response ) {

						if ( response.started ) {

							var recording_data = { id: source.recording_data_id, state: "recording", timestamp: Date.now(), source, urls };

							storage.save_recording_data( recording_data );
							private.fire({ receiver: "Content", name: "recording_started", recording_data });

						} else {

							private.fire({ receiver: "Content", name: "recording_not_started", recording_data: { source }, error: response.error });

						}

					});

				} else {

					private.fire({ receiver: "Content", name: "recording_not_started", recording_data: { source }, error: { name: "Internet Problem" } });

				}

			},

			cancel_recording: function ( source ) {

				recorder.cancel();
				storage.delete_recording_data( source.recording_data_id );
				private.fire({ receiver: "Content", name: "recording_canceled", recording_data: { source } });

			},

			finish_recording: function ( source ) {

				var recording_data;

				storage.id_to_recording_data( source.recording_data_id )
				.then( function ( data ) {

					state.last_recording_ts = Date.now();
					
					recording_data = data;

					private.fire({ receiver: "Content", name: "got_urls", recording_data });

					return recorder.finish();

				})
				.then( function ( data ) {
					
					state.last_recording_ts = Date.now();

					recording_data.data_url = data.data_url;
					recording_data.transcription_data = data.transcription_data;
					recording_data.state = "uploading";

					storage.update_recording_data( recording_data );

					upload_queue.push( recording_data );
					upload_queue.kickstart();

					private.fire({ receiver: "Content", name: "recording_finished", recording_data });
					private.fire({ receiver: "Content", name: "got_audio_data", recording_data });
						
				});

			}

		};

		var hub_handlers = {

			recording_data_uploaded: function ( data ) {

				storage.id_to_recording_data( data.id )
				.then( function ( recording_data) {

					recording_data.state = "uploaded";
					recording_data.data_url = "";

					storage.update_recording_data( recording_data );

					private.fire({ receiver: "Content", name: "recording_uploaded", recording_data });

				});

			},

			transcription_uploaded: function ( data ) {

				storage.id_to_recording_data( data.recording_data_id )
				.then( function ( recording_data ) {

					recording_data.transcription_url = data.transcription_url;
					storage.update_recording_data( recording_data );

				});

			},

			recording_timeout: function () {

				private.finish_recording();
				alert( "Peppermint recording timeout!" );

			}

		};

		var runtime_event_handlers = {

			start_recording: function ( message, sender, callback ) {

				message.source.tab_id = sender.tab ? sender.tab.id : 0;
				private.start_recording( message.source );

			},

			cancel_recording: function ( message, sender, callback ) {
		
				message.source.tab_id = sender.tab ? sender.tab.id : 0;
				private.cancel_recording( message.source );

			},

			finish_recording: function ( message, sender, callback ) {

				message.source.tab_id = sender.tab ? sender.tab.id : 0;
				private.finish_recording( message.source );

			},

			get_last_popup_recording: function ( message, sender, callback ) {

				storage.get_last_recording_data_by_source_name( "popup" )
				.then( callback );

			},

			get_last_popup_feedback_recording: function ( message, sender, callback ) {

				storage.get_last_recording_data_by_source_name( "popup_feedback" )
				.then( callback );

			},

			delete_transcription: function ( message, sender, callback ) {

				storage.id_to_recording_data( message.source.recording_data_id )
				.then( function ( recording_data ) {

					uploader.delete_transcription( recording_data );
					storage.delete_transcription( message.source.recording_data_id );

				});

			},

			get_recording_data_arr: function ( message, sender, callback ) {

				storage.get_recording_data_arr().then( callback );

			},

			delete_recording_data: function ( message, sender, callback ) {

				storage.delete_recording_data( message.recording_data.id );

			},

			get_tab_id: function ( message, sender, callback ) {

				callback( sender.tab.id );

			},

			short_url_to_recording_data: function ( message, sender, callback ) {

				backend_manager.short_url_to_recording_data( message.short_url )
				.then( callback )
				.catch( function () {
					callback( false );
				});

			}

		};
		
		( function handle_incoming_messages () {

			hub.add( hub_handlers );

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "GlobalController" ) {

					if ( runtime_event_handlers[ message.name ] ) {

						runtime_event_handlers[ message.name ]( message, sender, callback );
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
					});

					if ( time * 1000 > MAX_RECORDING_TIME ) {

						hub.fire( "recording_timeout" );

					}

				}

				setTimeout( tick, 20 );

			} () )

		} () );

	}