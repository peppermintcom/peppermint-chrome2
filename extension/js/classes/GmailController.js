
	function GmailController ( recorder, uploader, event_hub, chrome, letter_manager, $ ) {

		var state = {

			recording_id: undefined,
			compose_button_id: undefined,
			last_recording_blob: undefined,
			recording: false,
			uploading: false

		};

		var private = {

			get_sender_data: function () {
				return {
					sender_name: $("div[aria-label='Account Information'] .gb_jb").text(),
					sender_email: $("div[aria-label='Account Information'] .gb_kb").text()
				};
			},

			wait_the_interval: function () {
				return new Promise( function ( resolve ) {
					setTimeout( resolve, 5 * 60 * 1000 );
				});
			},

			copy_to_clipboard: function ( text ) {
				    
			    var doc = document,
			        temp = doc.createElement("textarea"),
			        initScrollTop = doc.body.scrollTop;
			    doc.body.insertBefore(temp, doc.body.firstChild);
			    temp.value = text;
			    temp.focus();
			    doc.execCommand("SelectAll");
			    doc.execCommand("Copy", false, null);
			    temp.blur();
			    doc.body.scrollTop = initScrollTop;
			    doc.body.removeChild(temp);
		
			},

			begin_recording: function () {

				recorder.start()
				.then( function () {

					$("#peppermint_timer")[0].reset();
					$("#peppermint_timer")[0].start();
					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

					state.recording = true;

				})
				.catch( function ( error ) {

					if ( error.name === "PermissionDeniedError" ) {
						
						console.log("permission denied");
						chrome.runtime.sendMessage( "open_welcome_page" );
						
					} else {
						
						$('#peppermint_popup').show();
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						
					}

				});
			},

			show_uploading_screen: function () {

				$("#peppermint_mini_popup_player")[0].reset();
				$("#peppermint_mini_popup_player")[0].disable();
				$("#peppermint_popup").hide();
				$("#peppermint_mini_popup")[0].reset();
				$("#peppermint_mini_popup")[0].set_state("uploading");
				$("#peppermint_mini_popup").show();

			},

			process_recording_blob: function ( blob ) {

				var recording_id = Date.now();

				state.recording_id = recording_id;
				state.last_recording_blob = blob;

				recorder.blob_to_data_url( blob )
				.then( function ( data_url ) {

					$("#peppermint_mini_popup_player")[0].enable();
					$("#peppermint_mini_popup_player")[0].set_url( data_url );

				});

				recorder.blob_to_buffer( blob )
				.then( function ( buffer ) {

					uploader.upload_buffer( buffer, private.get_sender_data() )
					.then( function ( url ) {

						if ( state.recording_id === recording_id ) {

							state.audio_url = url;

							$("#peppermint_mini_popup").hide();

							$( document ).one( "click", function () {
								private.copy_to_clipboard( url );
							});

							console.log( "uploaded:", url );
							$("#peppermint_mini_popup_player")[0].pause();
							letter_manager.add_link( state.audio_url, state.compose_button_id );
							state.compose_button_id = undefined;

						} else {

							console.log( "aborted recording url:", url );

						}

					})
					.catch( function () {

						$("#peppermint_mini_popup")[0].set_state("uploading_failed");

					});

				});
			},

			clear_the_state: function () {

				state = {

					recording_id: undefined,
					compose_button_id: undefined,
					last_recording_blob: undefined,
					recording: false,
					uploading: false

				};

			},

			finish_recording: function () {
				recorder.finish()
				.then( function ( blob ) {

					state.recording = false;
					private.process_recording_blob( blob );

				});
			}

		};

		$( document ).on( "peppermint_compose_button_click", function ( event ) {

			if ( !state.recording && !state.uploading ) {

				state.compose_button_id = event.target.dataset.id;

				private.begin_recording();

			}

		});

		$( document ).on( "peppermint_reply_button_click", function () {

			if ( $(".ams")[0] ) $(".ams")[0].click();
			
			var interval = setInterval( function () {
				if ( $( '#peppermint_compose_button' ).length > 0 ) {

					$( '#peppermint_compose_button' ).click();
					clearInterval( interval );

				}
			}, 20 );

		});

		$( document ).on( "error_try_again_button_click", "#peppermint_popup", function () {

			if ( !state.recording && !state.uploading ) {

				private.begin_recording();

			}
		
		});

		$( document ).on( "try_again_click", "#peppermint_mini_popup", function () {

			private.show_uploading_screen();
			
			private.process_recording_blob( state.last_recording_blob );

		});

		$( document ).on( "timeout", function () {
			stop_timer();
			
			private.show_uploading_screen();
			private.finish_recording();

			alert("You have reached the maximum recording length of 5 minutes");

		});

		$( document ).on( "recording_done_button_click", "#peppermint_popup", function () {

			private.show_uploading_screen();
			private.finish_recording();

		});

		$( document ).on( "error_cancel_button_click", "#peppermint_popup", function () {

			$("#peppermint_popup").hide();
			private.clear_the_state();

		});

		$( document ).on( "cancel_click", "#peppermint_mini_popup", function () {

			$("#peppermint_mini_popup").hide();
			$("#peppermint_mini_popup_player")[0].pause();
			private.clear_the_state();

		});

		$( document ).on( "recording_cancel_button_click", "#peppermint_popup", function () {

			recorder.cancel();
			$('#peppermint_popup').hide();
			private.clear_the_state();

		});

		event_hub.add({
			
			'timeout': function () {

			}

		});

	}

