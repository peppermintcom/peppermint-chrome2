
	function GmailController ( recorder, welcome_window_opener, event_hub ) {

		var state = {

			recording_id: undefined,
			compose_button_id: undefined,
			last_recording_blob: undefined,
			recording: false,
			uploading: false

		};

		var private = {

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

				})
				.catch( function ( error ) {

					if ( error.name === "PermissionDeniedError" ) {
						
						console.log("permission denied");
						welcome_window_opener.open();
						
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

				$( 'v-recorder' )[0].blob_to_data_url( blob )
				.then( function ( data_url ) {

					$("#peppermint_mini_popup_player")[0].enable();
					$("#peppermint_mini_popup_player")[0].set_url( data_url );

				});

				$( 'v-recorder' )[0].blob_to_buffer( blob )
				.then( function ( buffer ) {

					$( 'v-uploader' )[0].uploader.upload_buffer( buffer )
					.then( function ( url ) {

						if ( state.recording_id === recording_id ) {

							state.audio_url = url;

							$("#peppermint_mini_popup").hide();

							$( document ).one( "click", function () {
								copy_to_clipboard( url );
							});

							console.log( "uploaded:", url );
							$("#peppermint_mini_popup_player")[0].pause();
							$("#letter_manager")[0].add_link( state.audio_url, state.compose_button_id );
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

			}

		};

		$( document ).on( "peppermint_compose_button_click", function ( event ) {

			if ( !state.recording && !state.uploading ) {

				state.compose_button_id = event.target.dataset.id;
				state.recording = true;

				private.begin_recording();

			}

		});

		$( document ).on( "peppermint_reply_button_click", function () {

			$(".ams")[0].click();
			
			setTimeout( function () {
			
				$( '#peppermint_compose_button' ).click();
			
			}, 100 );

		});

		$( document ).on( "error_try_again_button_click", "#peppermint_popup", function () {

			if ( !state.recording && !state.uploading ) {

				state.recording = true;

				private.begin_recording();

			}
		
		});

		$( document ).on( "try_again_click", "#peppermint_mini_popup", function () {

			private.show_uploading_screen();
			
			private.process_recording_blob( state.last_recording_blob );

		});

		$( document ).on( "timeout", function () {
			stop_timer();
			
			show_uploading_screen();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {
				process_recording_blob( blob );
			});
			alert("You have reached the maximum recording length of 5 minutes");
		});

		$( document ).on( "recording_done_button_click", "#peppermint_popup", function () {

			private.show_uploading_screen();
				
			recorder.finish()
			.then( function ( blob ) {
				process_recording_blob( blob );
			});

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

