
	function TwitterController ( chrome, $, event_hub, letter_manager ) {

		var state = {

			recording_data_id: 0,
			recording: false,
			tab_id: 0

		};

		var private = {

		};

		( function set_up_dom_event_handling () {

			event_hub.add({

				tumblr_mic_button_click: function () {

					$( "#new_post_label_audio" )[ 0 ].click();

					if ( !state.recording ) {

						state.recording_data_id = Date.now();
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } })

					}

				},

				popup_recording_cancel_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							element: 'popup_recording_cancel_button' } } 
					});

				},

				popup_recording_done_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							element: 'popup_recording_done_button' } } 
					});

				},

				popup_error_try_again_button_click: function () {

					if ( !state.recording ) {

						state.recording_data_id = Date.now();
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } })

					}

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							recording_state: state.recording,
							element: 'popup_error_try_again_button' } } 
					});
				
				},

				popup_error_cancel_button_click: function () {

					$("#peppermint_popup").hide();

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							element: 'popup_error_cancel_button' } } 
					});

				},

				peppermint_reply_button_click: function () {

					$( ".amn span:first-child" ).click()
					
					var interval = setInterval( function () {
						if ( $( '#peppermint_compose_button' ).length > 0 ) {

							$( '#peppermint_compose_button' ).click();
							clearInterval( interval );

							chrome.runtime.sendMessage( { 
								receiver: 'GlobalAnalytics', name: 'track_analytic', 
								analytic: { name: 'user_action', val: { 
									name: 'gmailcontroller',
									action: 'click',
									element: 'peppermint_reply_button' } } 
							});

						}
					}, 20 );

				}

			});

			$( window ).unload( function () {

				if ( state.recording ) {
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } });
				}

			});

		} () );

		( function set_up_runtime_message_handling () {

			var message_handlers = {

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

				recording_details: function ( message ) {

					$( "#audio_visualizer" )[0].set_frequency_data( message.recording_details.frequency_data );
					$( "#peppermint_timer" )[0].set_time( message.recording_details.time * 1000 );

				},

				got_urls: function ( message ) {

					$( ".post-form--audio .editor.editor-plaintext span" )[ 0 ].innerText = message.recording_data.urls.canonical_url;
					
					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: message.recording_data.urls.short_url });
					$( "#peppermint_popup" ).hide();

				},

				got_audio_data: function ( message ) {

					console.log( message.recording_data.object_url );

					peppermint_popup_player

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: message.recording_data.urls.short_url });
					$( "#peppermint_popup" ).hide();

					state.recording = false;

				},

				recording_uploaded: function ( message ) {



				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" ) {

					if ( message_handlers[ message.name ] && message.recording_data && message.recording_data.source.tab_id === state.tab_id ) {

						message_handlers[ message.name ]( message, sender, callback );

					} else if ( message_handlers[ message.name ] && message.name === "recording_details" ) {

						message_handlers[ message.name ]( message, sender, callback );

					}

				}

			});

		} () );

		( function init () {

			chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_tab_id" }, function ( tab_id ) {

				state.tab_id = tab_id;

			});

		} () );

	}

