
	function GmailController ( chrome, $, hub ) {

		var state = {

			compose_button_id: undefined,
			recording_data_id: 0,
			recording: false,
			tab_id: 0

		};

		var handle = {

			/* dom */

				peppermint_compose_button_click: function ( data ) {

					if ( !state.recording ) {

						chrome.storage.local.set({ compose_button_has_been_used: true });

						state.compose_button_id = data.id;
						state.recording_data_id = Date.now();

						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } })

					}

					chrome.runtime.sendMessage({ 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							recording_state: state.recording,
							element: 'peppermint_compose_button',
							id: state.compose_button_id } } 
					});

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

				},

				unload: function () {

					if ( state.recording ) {
						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "gmail", recording_data_id: state.recording_data_id } });
					}

				},

			/**/

			/* runtime */

				runtime_message: function ( message, sender, callback ) {

					if ( message.receiver === "Content" ) {

						if ( handle[ message.name ] && message.recording_data && message.recording_data.source.tab_id === state.tab_id ) {

							handle[ message.name ]( message, sender, callback );

						}

					}

				},

				recording_started: function ( message ) {

					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

					$( "div[data-id='{{ID}}']".replace( "{{ID}}", state.compose_button_id ) ).find( ".pep_recording_button" )[ 0 ].start();

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

					$( "div[data-id='{{ID}}']".replace( "{{ID}}", state.compose_button_id ) ).find( ".pep_recording_button" )[ 0 ].stop();

				},

				got_urls: function ( message ) {

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: message.recording_data.urls.short_url });
					$( "#peppermint_popup" ).hide();
					
					hub.fire( "got_recording_urls", {
						
						compose_window_id: state.compose_button_id,
						recording_data: message.recording_data

					});

					$( "div[data-id='{{ID}}']".replace( "{{ID}}", state.compose_button_id ) ).find( ".pep_recording_button" )[ 0 ].stop();

				},

				got_audio_data: function ( message ) {

					state.recording = false;
					
					hub.fire( "got_recording_audio", {
						
						compose_window_id: state.compose_button_id,
						recording_data: message.recording_data

					});
					
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

				peppermint_compose_button_click: handle.peppermint_compose_button_click,
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

