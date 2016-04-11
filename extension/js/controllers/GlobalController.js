
	function GlobalController ( chrome, $, hub, recorder, uploader, upload_queue, storage, backend_manager ) {

		var MAX_RECORDING_TIME = 5 * 60 * 1000;

		var state = {

			last_recording_source: null,
			interval: 0

		};

		var proc = {

			get_timeout_function: function ( id ) {

				return function () {

					if ( state.last_recording_source.recording_data_id === id ) {

						hub.fire( "recording_timeout" );
						
					}


				}

			},

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

				if ( urls ) {

					recorder.start()
					.then( function ( response ) {

						if ( response.started ) {

							var recording_data = { id: source.recording_data_id, state: "recording", timestamp: Date.now(), source, urls };

							setTimeout( proc.get_timeout_function( source.recording_data_id ), MAX_RECORDING_TIME );

							state.last_recording_source = source;
							storage.save_recording_data( recording_data );
							proc.fire({ receiver: "Content", name: "recording_started", recording_data });

						} else {

							proc.fire({ receiver: "Content", name: "recording_not_started", recording_data: { source }, error: response.error });

						}

					});

				} else {

					proc.fire({ receiver: "Content", name: "recording_not_started", recording_data: { source }, error: { name: "internet_problem" } });

				}

			},

			cancel_recording: function ( source ) {

				clearInterval( state.interval );
				recorder.cancel();
				storage.delete_recording_data( source.recording_data_id );
				proc.fire({ receiver: "Content", name: "recording_canceled", recording_data: { source } });

			},

			finish_recording: function ( source ) {

				var recording_data;

				storage.id_to_recording_data( source.recording_data_id )
				.then( function ( data ) {

					clearInterval( state.interval );
					recording_data = data;
					recording_data.state = "uploading";

					storage.update_recording_data( recording_data );

					proc.fire({ receiver: "Content", name: "got_urls", recording_data });

					return recorder.finish();

				})
				.then( function ( data ) {

					recording_data.data_url = data.data_url;
					recording_data.transcription_data = data.transcription_data;

					storage.update_recording_data( recording_data );

					upload_queue.push( recording_data );
					upload_queue.kickstart();

					proc.fire({ receiver: "Content", name: "recording_finished", recording_data });
					proc.fire({ receiver: "Content", name: "got_audio_data", recording_data });
						
				});

			}

		};

		var handle = {

			/* hub */

				recording_data_uploaded: function ( data ) {

					storage.id_to_recording_data( data.id )
					.then( function ( recording_data) {

						recording_data.state = "uploaded";
						recording_data.data_url = "";

						storage.update_recording_data( recording_data );

						proc.fire({ receiver: "Content", name: "recording_uploaded", recording_data });

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

					proc.finish_recording( state.last_recording_source );
					alert( "Peppermint recording timeout!" );

				},

				start: function () {

					storage.delete_unfinished_recordings();

				},

			/**/

			/* runtime */

				runtime_message: function ( message, sender, callback ) {

					if ( message.receiver === "GlobalController" ) {

						if ( handle[ message.name ] ) {

							handle[ message.name ]( message, sender, callback );
							return true;

						}

					}

				},

				start_recording: function ( message, sender, callback ) {

					message.source.tab_id = sender.tab ? sender.tab.id : 0;
					proc.start_recording( message.source );

				},

				cancel_recording: function ( message, sender, callback ) {
			
					message.source.tab_id = sender.tab ? sender.tab.id : 0;
					proc.cancel_recording( message.source );

				},

				finish_recording: function ( message, sender, callback ) {

					message.source.tab_id = sender.tab ? sender.tab.id : 0;
					proc.finish_recording( message.source );

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
					.catch( function ( error ) {
						callback( false );
					});

				},

				get_recording_details: function ( message, sender, callback ) {

					var frequency_data = recorder.get_frequency_data();
					var time = recorder.get_time();

					callback({ frequency_data, time });

				}

			/**/

		};
		
		( function () {

			hub.add({

				recording_data_uploaded: handle.recording_data_uploaded,
				transcription_uploaded: handle.transcription_uploaded,
				recording_timeout: handle.recording_timeout,
				start: handle.start

			});

			chrome.runtime.onMessage.addListener( handle.runtime_message );

		} () );

	}