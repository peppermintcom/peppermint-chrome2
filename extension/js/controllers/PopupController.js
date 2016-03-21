
	function PopupController ( chrome, $, event_hub ) {

		var state = {

			current_recording_data: null,
			recording: false
			
		};

		var private = {

			begin_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "start" }, function ( response ) {

					if ( response.started ) {

						$( ".screen" ).hide();
						$( "#recording_screen" ).show();
						
						private.update_popup_state({ screen_name: "recording_screen" });

						state.timeout_has_been_reported = false;
						state.recording = true;
						chrome.storage.local.set({ recording_in_popup: true });

					} else {

						console.error( "Failed to begin recording", response.error );

						if ( response.error.name === "PermissionDeniedError" || response.error.name === "NavigatorUserMediaError" ) {
						
							chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });

						} else if ( response.error.name === "already_recording" ) {

							$( "#error_message" ).text( "You are already recording!" );
							$( ".screen" ).hide();
							$( "#error_screen" ).show();

							private.update_popup_state({
								screen_name: "error_screen",
								error_message: "You are already recording!"
							});

						} else {

							$( "#error_message" ).text( "Your microphone is not working. Please check your audio settings and try again." );
							$( ".screen" ).hide();
							$( "#error_screen" ).show();
						
							private.update_popup_state({
								screen_name: "error_screen",
								error_message: "Your microphone is not working. Please check your audio settings and try again."
							});

						}

					}
					

				});

			},

			cancel_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "cancel" }, function ( response ) {


					$( ".screen" ).hide();
					$( "#start_screen" ).show();

					state.recording = false; 
					chrome.storage.local.set({ recording_in_popup: false });
					
					private.update_popup_state({ screen_name: "start_screen" });

				});

			},

			finish_recording: function () {

				return new Promise( function ( resolve ) {

					chrome.runtime.sendMessage( { receiver: "GlobalUploader", name: "get_urls" }, function ( urls ) {

						var recording_data = state.current_recording_data = { urls, source: "popup", id: Date.now(), uploaded: false };
						chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "save_recording_data", recording_data });

						$( "#transcript" ).text( "" );
						$( "#player" )[0].disable();

						$( "#popup_finish_url" )[0].href = urls.short_url;
						$( "#popup_finish_url" ).text( urls.short_url );
						$( ".screen" ).hide();
						$( "#finish_screen" ).show();

						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: urls.short_url });

						private.update_popup_state({ screen_name: "finish_screen" });

						chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "finish", recording_data }, function ( recording_data ) {

							chrome.storage.local.set({ recording_in_popup: false });
							state.recording = false;
							state.current_recording_data = recording_data;
							chrome.runtime.sendMessage({ reciver: "GlobalStorage", name: "update_recording_data", recording_data });

							$( "#transcript" ).text( recording_data.transcription_data.text );
							if ( recording_data.transcription_data.text ) $( "#transcription_header" ).show();
							$( "#player" )[0].set_url( recording_data.uploaded ? recording_data.urls.canonical_url : recording_data.data_url );
							$( "#player" )[0].enable();

						});

					});

				});

			},

			init_popup_state: function ( popup_state ) {

				$( ".screen" ).hide();

				$( "#" + ( popup_state.screen_name || "start_screen" ) ).show();
				
				if ( popup_state.error_message ) $( "#error_message" ).text( popup_state.error_message );

				if ( popup_state.page === "recording_page" ) {

					state.recording = true;
					state.timeout_has_been_reported = false;

				};

				if ( popup_state.last_recording_data ) {

					$( "#popup_finish_url" )[0].href = popup_state.last_recording_data.urls.short_url;
					$( "#popup_finish_url" ).text( popup_state.last_recording_data.urls.short_url );

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: popup_state.last_recording_data.urls.short_url });

					if ( popup_state.last_recording_data.transcription_data.text ) {

						$( "#transcription_header" ).show();
						$( "#transcript" ).html( popup_state.last_recording_data.transcription_data.text );

					} else {

						$( "#transcription_header" ).hide();

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

			},

			create_click_dispatcher: function ( id ) {
				document.getElementById( id ).addEventListener( "click", function () {
					event_hub.fire( id + "_click" );
				});
			}

		};

		event_hub.add({

			welcome_start_recording_click: function () {

				private.begin_recording();

			},

			recording_cancel_button_click: function () {

				private.cancel_recording();

			},

			recording_done_button_click: function () {
				
				private.finish_recording();

			},

			error_cancel_button_click: function () {

				$( ".screen" ).hide();
				$( "#start_screen" ).show();
				private.update_popup_state({ screen_name: "start_screen" });

			},

			error_try_again_button_click: function () {

				private.begin_recording();

			},

			finish_start_new_button_click: function () {

				private.begin_recording();

			},

			delete_transcription_button_click: function () {

				$( "#transcript" ).text( "" );
				$( "#transcription_header" ).hide();
				chrome.runtime.sendMessage({ receiver: "GlobalUploader", name: "delete_transcription", recording_data: state.current_recording_data });
				chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "delete_transcription", recording_data: state.current_recording_data });

			}

		});

		[
			"delete_transcription_button",
			"recording_cancel_button",
			"welcome_start_recording",
			"finish_start_new_button",
			"error_try_again_button",
			"recording_done_button",
			"error_cancel_button"
		].forEach( private.create_click_dispatcher );

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