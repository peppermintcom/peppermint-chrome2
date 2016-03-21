
	function GmailController ( chrome, $, event_hub, letter_manager ) {

		var state = {

			timeout_has_been_reported: false,
			compose_button_id: undefined,
			recording: false,

		};

		var private = {

			begin_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "start" }, function ( response ) {

					if ( response.started ) {

						$('#peppermint_popup').show();
						$('#peppermint_popup')[0].set_page("recording_page");
						$('#peppermint_popup')[0].set_page_status("recording");

						state.timeout_has_been_reported = false;
						state.recording = true;

					} else {
						
						console.error( "Failed to begin recording", response.error );

						if ( response.error.name === "PermissionDeniedError" || response.error.name === "NavigatorUserMediaError" ) {
							
							chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });
							
						} else if ( response.error.name === "already_recording" ) {

							$('#peppermint_popup')[0].set_error_message( "You are already recording!" );
							$('#peppermint_popup')[0].set_page("microphone_error_page");
							$('#peppermint_popup').show();

						} else {

							$('#peppermint_popup')[0].set_error_message( "Your microphone is not working. Please check your audio settings and try again." );
							$('#peppermint_popup')[0].set_page("microphone_error_page");
							$('#peppermint_popup').show();
							
						}

					}

				});

			},

			cancel_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "cancel" }, function ( response ) {

					$( "#peppermint_popup" )[0].set_page("popup_welcome");
					state.recording = false; 

				});

			},

			finish_recording: function ( data ) {

				return new Promise( function ( resolve ) {

					chrome.runtime.sendMessage( { receiver: "GlobalUploader", name: "get_urls" }, function ( urls ) {

						var recording_data = { urls, uploaded: false, source: "gmail", id: Date.now(), duration: $( "#peppermint_timer" )[0].get_time() };
						chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "save_recording_data", recording_data });

						$( "#peppermint_popup" ).hide();

						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: urls.short_url });

						private.add_to_compose( recording_data );

						chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "finish", recording_data }, function ( recording_data ) {

							chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "update_recording_data", recording_data });

							state.recording = false;
							console.log( "recording_data", recording_data );
							letter_manager.add_recording_data_to_a_letter( recording_data );

						});

					});

				});

			},
			
			add_to_compose: function( recording_data ) {
								
				$("#peppermint_mi_popup").hide();

				letter_manager.add_link( state.compose_button_id, recording_data );  

			}

		};

		event_hub.add({

			peppermint_compose_button_click: function ( data ) {

				if ( !state.recording ) {

					chrome.storage.local.set({ compose_button_has_been_used: true });

					state.compose_button_id = data.id;

					private.begin_recording();

				}

			},

			popup_recording_cancel_button_click: function () {

				$('#peppermint_popup').hide();
				private.cancel_recording();

			},

			popup_recording_done_button_click: function () {

				private.finish_recording();

			},

			popup_error_try_again_button_click: function () {

				if ( !state.recording ) {

					private.begin_recording();

				}
			
			},

			popup_error_cancel_button_click: function () {

				$("#peppermint_popup").hide();

			},

			peppermint_reply_button_click: function () {

				if ( $(".ams")[0] ) $(".ams")[0].click();
				
				var interval = setInterval( function () {
					if ( $( '#peppermint_compose_button' ).length > 0 ) {

						$( '#peppermint_compose_button' ).click();
						clearInterval( interval );

					}
				}, 20 );

			}

		});

		( function constructor () {

			$( window ).unload( function () {

				if ( state.recording ) private.cancel_recording();

			});

			( function tick () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_frequency_data" }, function ( frequency_data ) {

					if ( frequency_data ) {

						$( "#audio_visualizer" )[0].set_frequency_data( frequency_data );
						
					}

				});

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_time" }, function ( time ) {

					if ( time ) {

						$( "#peppermint_timer" )[0].set_time( time * 1000 );
						
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

