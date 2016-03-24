
	function PopupController ( chrome, $, event_hub ) {

		var state = {

			recording_data: null

		}

		var private = {

		};

		( function set_up_dom_event_handling () {

			event_hub.add({

				welcome_start_recording_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup" } })

				},

				recording_cancel_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "popup" } })

				},

				recording_done_button_click: function () {
					
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "popup" } })

				},

				error_cancel_button_click: function () {

					$( ".screen" ).hide();
					$( "#start_screen" ).show();

				},

				error_try_again_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup" } })

				},

				finish_start_new_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup" } })

				},

				delete_transcription_button_click: function () {

					$( "#transcript" ).text( "" );
					$( "#transcription_header" ).hide();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "delete_transcription", recording_data: state.recording_data })

				}

			});

			function create_click_dispatcher ( id ) {
				document.getElementById( id ).addEventListener( "click", function () {
					event_hub.fire( id + "_click" );
				});
			};

			[
				"delete_transcription_button",
				"recording_cancel_button",
				"welcome_start_recording",
				"finish_start_new_button",
				"error_try_again_button",
				"recording_done_button",
				"error_cancel_button"
			].forEach( create_click_dispatcher );

		} () );

		( function set_up_runtime_message_handling () {

			var message_handlers = {

				recording_started: function ( message ) {

					$( ".screen" ).hide();
					$( "#recording_screen" ).show();
					$( "#transcription_header" ).hide();

				},

				recording_not_started: function ( message ) {

					console.log( "Failed to begin recording", message.error );

					if ( message.error.name === "PermissionDeniedError" || message.error.name === "NavigatorUserMediaError" ) {
					
						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });

					} else if ( message.error.name === "already_recording" ) {

						$( "#error_message" ).text( "You are already recording!" );
						$( ".screen" ).hide();
						$( "#error_screen" ).show();

					} else {

						$( "#error_message" ).text( "Your microphone is not working. Please check your audio settings and try again." );
						$( ".screen" ).hide();
						$( "#error_screen" ).show();

					}

				},

				recording_canceled: function ( message ) {

					$( ".screen" ).hide();
					$( "#start_screen" ).show();

				},

				recording_details: function ( message ) {

					$( "#audio_visualizer" )[0].set_frequency_data( message.recording_details.frequency_data );
					$( "#timer" )[0].set_time( message.recording_details.time * 1000 );

				},

				got_urls: function ( message ) {

					state.recording_data = message.recording_data;

					$( "#transcript" ).text( "" );
					$( "#player" )[0].disable();

					$( "#popup_finish_url" )[0].href = message.recording_data.urls.short_url;
					$( "#popup_finish_url" ).text( message.recording_data.urls.short_url );
					$( ".screen" ).hide();
					$( "#finish_screen" ).show();

				},

				got_audio_data: function ( message ) {

					state.recording_data = message.recording_data;
						
					$( "#transcript" ).text( message.recording_data.transcription_data.text );
					if ( message.recording_data.transcription_data.text ) $( "#transcription_header" ).show();
					$( "#player" )[0].set_url( message.recording_data.uploaded ? message.recording_data.urls.canonical_url : message.recording_data.data_url );
					$( "#player" )[0].enable();

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" && message.target && message.target.name === "popup" ) {

					if ( message_handlers[ message.name ] ) {

						message_handlers[ message.name ]( message );

					}

				}

			});

		} () );

		( function init () {

			chrome.runtime.sendMessage( { receiver: "GlobalController", name: "get_last_popup_recording" }, function ( data ) {

				if ( data ) {

					state.recording_data = data;

					if ( data.state === "recording" ) {

						$( ".screen" ).hide();
						$( "#recording_screen" ).show();

					} else {

						$( ".screen" ).hide();
						$( "#finish_screen" ).show();

						$( "#popup_finish_url" )[0].href = data.urls.short_url;
						$( "#popup_finish_url" ).text( data.urls.short_url );

						if ( data.transcription_data.text ) {

							$( "#transcription_header" ).show();
							$( "#transcript" ).html( data.transcription_data.text );

						} else {

							$( "#transcription_header" ).hide();

						}

						if ( data.data_url || data.urls.canonical_url ) {

							$( "#player" )[0].set_url( data.state === "uploaded" ? data.urls.canonical_url : data.data_url );
							$( "#player" )[0].enable();

						} else {

							$( "#player" )[0].disable();

						}

					}

				} else {

					$( ".screen" ).hide();
					$( "#start_screen" ).show();

				}

			});

		} () );

	}