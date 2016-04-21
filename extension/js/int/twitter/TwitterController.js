
	function TwitterController ( chrome, window, $, hub ) {

		var state = {

			recording_data_id: 0,
			recording: false,
			tab_id: 0

		};

		var conv = {

			rec_data_to_tweet: function ( rec_data ) {

				var postfix = "... ";
				var trans_len = 140 - rec_data.urls.short_url.length;
				var transcript = rec_data.transcription_data.text;

				if ( transcript.length < 140 - " ".length - rec_data.urls.short_url.length ) {

					return transcript + " "  + rec_data.urls.short_url;

				} else {

					return transcript.slice( 0, 140 - rec_data.urls.short_url.length - postfix.length ) + postfix + rec_data.urls.short_url;

				}


			}

		};

		var handle = {

			/* dom */

				compose_button_click: function () {

					if ( !state.recording ) {

						state.recording_data_id = Date.now();

						$( "button#global-new-tweet-button" ).get(0).click();
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "twitter", recording_data_id: state.recording_data_id } })

					}

				},

				popup_recording_cancel_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "twitter", recording_data_id: state.recording_data_id } })

				},

				popup_recording_done_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "twitter", recording_data_id: state.recording_data_id } })

				},

				popup_error_try_again_button_click: function () {

					if ( !state.recording ) {

						state.recording_data_id = Date.now();

						$( "button#global-new-tweet-button" ).get(0).click();
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "twitter", recording_data_id: state.recording_data_id } })

					}

				},

				popup_error_cancel_button_click: function () {

					$("#peppermint_popup").hide();

				},

				unload: function () {

					if ( state.recording ) {
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "twitter", recording_data_id: state.recording_data_id } });
					}

				},

			/**/

			/* runtime */

				runtime_message: function ( message, sender, callback ) {

					if ( message.receiver === "Content" ) {

						if ( handle[ message.name ] && message.recording_data && message.recording_data.source.tab_id === state.tab_id ) {

							handle[ message.name ]( message, sender, callback );

						}

					} else if ( message.name === "content_ping" ) {

						handle[ message.name ]( message, sender, callback );

					}

				},

				content_ping: function ( message, sender, callback ) {
					
					console.log( "ping" );
					callback( true );

				},

				recording_started: function ( message ) {

					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

					state.recording = true;

				},

				recording_not_started: function ( message ) {

					console.error( "Failed to begin recording", message.error );

					if ( message.error.name === "PermissionDeniedError" || message.error.name === "NavigatorUserMediaError" ) {
						
						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });
						
					} else if ( message.error.name === "already_recording" ) {

						$('#peppermint_popup')[0].set_error_message( "You are already recording!" );
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						$('#peppermint_popup').show();

					} else {

						$('#peppermint_popup')[0].set_error_message( "Your microphone is not working. Please check your audio settings and try again." );
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						$('#peppermint_popup').show();
						
					}

				},

				recording_canceled: function ( message ) {

					state.recording = false;
					$('#peppermint_popup').hide();

				},

				got_urls: function ( message ) {

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: message.recording_data.urls.short_url });
					$( "#peppermint_popup" ).hide();

				},

				got_audio_data: function ( message ) {

					state.recording = false;

					$( "#tweet-box-global" ).html(
						"<div>"+
						conv.rec_data_to_tweet( message.recording_data ) +
						"</div>"
					);

				},

			/**/

			/* misc */

				tick: function () {

					if ( state.recording ) {

						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_recording_details" }, function ( recording_details ) {

							$( "#audio_visualizer" )[0].set_frequency_data( recording_details.frequency_data );
							$( "#peppermint_timer" )[0].set_time( recording_details.time * 1000 );

						});

					}

					requestAnimationFrame( handle.tick );

				},

				start: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_tab_id" }, function ( tab_id ) {

						state.tab_id = tab_id;

					});

					handle.tick();

				}

			/**/

		};

		( function () {

			hub.add({

				compose_button_click: handle.compose_button_click,
				popup_recording_cancel_button_click: handle.popup_recording_cancel_button_click,
				popup_recording_done_button_click: handle.popup_recording_done_button_click,
				popup_error_try_again_button_click: handle.popup_error_try_again_button_click,
				popup_error_cancel_button_click: handle.popup_error_cancel_button_click,
				peppermint_reply_button_click: handle.peppermint_reply_button_click,
				start: handle.start

			});

			$( window ).unload( handle.unload );

			chrome.runtime.onMessage.addListener( handle.runtime_message );

		} () );

	}

