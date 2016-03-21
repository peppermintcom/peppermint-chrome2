
	function PopupController ( chrome, $, event_hub ) {

		var state = {

			current_recording_data: null,
			recording: false
			
		};

		var private = {

			begin_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "start" }, function ( response ) {

					if ( response.started ) {

						$( "#popup" ).show();
						$( "#popup" )[0].set_page("recording_page");
						$( "#popup" )[0].set_page_status("recording");
						
						private.update_popup_state({
							page: "recording_page",
							page_status: "recording"
						});

						state.timeout_has_been_reported = false;
						state.recording = true;

					} else {

						console.error( "Failed to begin recording", response.error );

						if ( response.error.name === "PermissionDeniedError" || response.error.name === "NavigatorUserMediaError" ) {
						
							chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });

						} else if ( response.error.name === "already_recording" ) {

							$( "#popup" )[0].set_error_message( "You are already recording!" );
							$( "#popup" )[0].set_page("microphone_error_page");
							$( "#popup" ).show();

							private.update_popup_state({
								page: "microphone_error_page",
								error_message: "You are already recording!"
							});

						} else {

							$( "#popup" )[0].set_error_message( "Your microphone is not working. Please check your audio settings and try again." );
							$( "#popup" )[0].set_page("microphone_error_page");
							$( "#popup" ).show();
						
							private.update_popup_state({
								page: "microphone_error_page",
								error_message: "Your microphone is not working. Please check your audio settings and try again."
							});

						}

					}
					

				});

			},

			cancel_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "cancel" }, function ( response ) {

					$( "#popup" )[0].set_page("popup_welcome");
					state.recording = false; 
					
					private.update_popup_state({

						page: "popup_welcome"

					});

				});

			},

			finish_recording: function () {

				return new Promise( function ( resolve ) {

					chrome.runtime.sendMessage( { receiver: "GlobalUploader", name: "get_urls" }, function ( urls ) {

						var recording_data = state.current_recording_data = { urls, source: "popup", id: Date.now(), uploaded: false };
						chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "save_recording_data", recording_data });

						$( "#popup" )[0].set_transcript( "" );
						$( "#player" )[0].disable();

						$( "#popup" )[0].set_url( urls.short_url );
						$( "#popup" )[0].set_page("popup_finish");
						$( "#popup" )[0].set_page_status("finished");

						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: urls.short_url });

						private.update_popup_state({

							page: "popup_finish",
							page_status: "finished",

						});

						chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "finish", recording_data }, function ( recording_data ) {

							state.recording = false;
							state.current_recording_data = recording_data;
							chrome.runtime.sendMessage({ reciver: "GlobalStorage", name: "update_recording_data", recording_data });

							$( "#popup" )[0].set_transcript( recording_data.transcription_data.text );
							$( "#player" )[0].set_url( recording_data.uploaded ? recording_data.urls.canonical_url : recording_data.data_url );
							$( "#player" )[0].enable();

						});

					});

				});

			},

			init_popup_state: function ( popup_state ) {

				$( "#popup" ).css({ display: "block" }).show();

				$( "#popup" )[0].set_page( popup_state.page || "popup_welcome" );
				
				if ( popup_state.page_status ) $( "#popup" )[0].set_page_status( popup_state.page_status );

				if ( popup_state.error_message ) $( "#popup" )[0].set_error_message( popup_state.error_message );

				if ( popup_state.page === "recording_page" ) {

					state.recording = true;
					state.timeout_has_been_reported = false;

				};

				if ( popup_state.last_recording_data ) {

					$( "#popup" )[0].set_url( popup_state.last_recording_data.urls.short_url );

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: popup_state.last_recording_data.urls.short_url });

					if ( popup_state.last_recording_data.transcription_data ) {

						$( "#popup" )[0].set_transcript( popup_state.last_recording_data.transcription_data.text );

					}

					if ( popup_state.last_recording_data.data_url || popup_state.last_recording_data.urls.canonical_url ) {

						$( "#player" )[0].set_url( popup_state.last_recording_data.uploaded ? popup_state.last_recording_data.urls.canonical_url : popup_state.last_recording_data.data_url );
						$( "#player" )[0].enable();

					} else {

						$( "#player" )[0].disable();

					}

				};

			},

			update_popup_state: function ( popup_state ) {

				chrome.storage.local.get( [ "popup_state" ], function ( items ) {

					$.extend( true, items.popup_state, popup_state );
					chrome.storage.local.set({ popup_state: items.popup_state });

				});

			}

		};

		event_hub.add({

			popup_welcome_start_recording_click: function () {

				private.begin_recording();

			},

			popup_recording_cancel_button_click: function () {

				private.cancel_recording();

			},

			popup_recording_done_button_click: function () {
				
				private.finish_recording();

			},

			popup_error_cancel_button_click: function () {

				$( "#popup" )[0].set_page( "popup_welcome" );
				private.update_popup_state({ page: "popup_welcome" });

			},

			popup_error_try_again_button_click: function () {

				private.begin_recording();

			},

			popup_finish_start_new_button_click: function () {

				private.begin_recording();

			},

			popup_delete_transcription_button_click: function () {

				$( "#popup" )[ 0 ].set_transcript( false );
				chrome.runtime.sendMessage({ receiver: "GlobalUploader", name: "delete_transcription", recording_data: state.current_recording_data });
				chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "delete_transcription", recording_data: state.current_recording_data });

			}

		});

		( function constructor () {

			chrome.storage.local.set({ "browser_action_popup_has_been_opened": true });

			chrome.storage.local.get( [ "popup_state" ], function ( items ) {

				var recording_data_arr = items["recording_data_arr"];
			
				chrome.runtime.sendMessage( { receiver: "GlobalStorage", name: "get_last_recording_data_by_source", source: "popup" }, function ( recording_data ) {

					state.current_recording_data = recording_data;
					items.popup_state.last_recording_data = recording_data;
				
					private.init_popup_state( items.popup_state );

				});

			});

			( function tick () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_frequency_data" }, function ( frequency_data ) {

					if ( frequency_data ) {

						$( "#audio_visualizer" )[0].set_frequency_data( frequency_data );
						
					}

				});

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_time" }, function ( time ) {

					if ( time ) {

						$( "#timer" )[0].set_time( time * 1000 );
						
					}

				});

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_timeout" }, function ( timeout ) {

					if ( timeout && !state.timeout_has_been_reported && state.recording ) {

						private.finish_recording();
						state.timeout_has_been_reported = true;
						alert( "Peppermint recording timeout!" );
						
					}

				});

				requestAnimationFrame( tick );

			} () )

		} () );

	}