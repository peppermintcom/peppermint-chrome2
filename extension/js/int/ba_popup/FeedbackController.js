
	function FeedbackController ( chrome, $, event_hub ) {

		var state = {

			recording_data_id: 0,
			recording: false

		};

		var proc = {

			send_feedback: function ( feedback_url ) {
			
				$.ajax({
			
					type: "POST",
					url: "https://api.sparkpost.com/api/v1/transmissions",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
						"Authorization": "74d47793522fa8f719c94d6274d8654d8be93817",
						"Cache-Control": "no-cache",
						"Postman-Token": "ea8b8ebd-78f5-e129-dce7-aef38986c7cd"
					},
					data: JSON.stringify({
						"campaign_id": "chrome_audio_feedback",
						"recipients": [
							{
								"address": "support@peppermint.com"
							}
						],
						"content": {
							"template_id": "chrome-audio-feedback",
							"use_draft_template": true
						},
						"substitution_data" : {
							"from_name": "Some Chrome User",
							"url": feedback_url
						}
					})
			
				});
			
			}

		};

		var handle = {

			/* hub */

				feedback_start_click: function () {

					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup_feedback", recording_data: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { type: 'click', name : 'feedback_start_click', element: 'feedback_tab' } } 
					});	

				},

				feedback_cancel_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "popup_feedback", recording_data: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { type: 'click', name : 'feedback_cancel_click', element: 'feedback_tab' } } 
					});	

				},

				feedback_finish_click: function () {
					
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "popup_feedback", recording_data: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { type: 'click', name : 'feedback_finish_click', element: 'feedback_tab' } } 
					});	

				},

			/**/

			/* runtime */

				runtime_message: function ( message, sender, callback ) {

					if ( message.receiver === "Content" ) {

						if ( handle[ message.name ] && message.recording_data && message.recording_data.source.name === "popup_feedback" ) {

							handle[ message.name ]( message, sender, callback );

						}

					}

				},

				recording_started: function ( message ) {

					state.recording = true;
					
					$( "#feedback_audio_visualizer" ).css( "opacity", "1" );
					$( "#feedback_timer" ).css( "opacity", "1" );
					$( "#feedback_start" ).hide();
					$( "#feedback_buttons" ).show();

				},

				recording_not_started: function ( message ) {
					
				},

				recording_canceled: function ( message ) {

					state.recording = false;

					$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
					$( "#feedback_timer" ).css( "opacity", "0" );
					$( "#feedback_start" ).show();
					$( "#feedback_buttons" ).hide();

				},
				
				got_urls: function ( message ) {

					state.recording = false;

					$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
					$( "#feedback_timer" ).css( "opacity", "0" );
					$( "#feedback_start" ).show();
					$( "#feedback_buttons" ).hide();

					$( "#feedback_thank_you" ).animate({ opacity: 1 });
					
					proc.send_feedback( message.recording_data.urls.short_url );

					setTimeout( function () { $( "#feedback_thank_you" ).animate({ opacity: 0 }); }, 2000 );

				},

			/**/

			/* misk */

				start: function () {

					chrome.runtime.sendMessage( { receiver: "GlobalController", name: "get_last_popup_feedback_recording" }, function ( data ) {

						if ( data ) {

							state.recording_data_id = data.id;

						}

						if ( data && data.state === "recording" ) {
							
							state.recording = true;

							$( "#feedback_audio_visualizer" ).css( "opacity", "1" );
							$( "#feedback_timer" ).css( "opacity", "1" );
							$( "#feedback_start" ).hide();
							$( "#feedback_buttons" ).show();

						} else {

							$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
							$( "#feedback_timer" ).css( "opacity", "0" );
							$( "#feedback_start" ).show();
							$( "#feedback_buttons" ).hide();

						}

					});

					( function tick () {

						if ( state.recording ) {

							chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_recording_details" }, function ( recording_details ) {

								$( "#feedback_timer" )[0].set_time( recording_details.time * 1000 );
								$( "#feedback_audio_visualizer" )[0].set_frequency_data( recording_details.frequency_data );

							});

						}

						requestAnimationFrame( tick );

					} () )

				}

			/**/

		};

		( function () {

			event_hub.add({

				feedback_start_click: handle.feedback_start_click,
				feedback_cancel_click: handle.feedback_cancel_click,
				feedback_finish_click: handle.feedback_finish_click,
				start: handle.start

			});

			function create_click_dispatcher ( id ) {
				document.getElementById( id ).addEventListener( "click", function () {
					event_hub.fire( id + "_click" );
				});
			};

			[
				"feedback_start",
				"feedback_cancel",
				"feedback_finish"
			].forEach( create_click_dispatcher );

			chrome.runtime.onMessage.addListener( handle.runtime_message );

		} () );

	}
