
	( function () {

		var State = function () {

			var private = {


			};

			var public = {

				set_recording_id: function ( recording_id ) {
					private.recording_id = recording_id;
				},
				get_recording_id: function () {
					return private.recording_id;
				},
				set_compose_button_id: function ( id ) {
					private.compose_button_id = id;
				},
				get_compose_button_id: function () {
					return private.compose_button_id;
				},
				get_audio_url: function () {
					return private.audio_url;
				},
				set_audio_url: function ( url ) {
					private.audio_url = url;
				}

			};

			return public;

		};

		var g_state = new State();


		$( document ).on( "compose_button_click", function ( event ) {

			if ( g_state.get_compose_button_id() ) return;

			g_state.set_compose_button_id( event.target.dataset["id"] );

			$( 'v-recorder' )[0].start()
			.then( function () {
				$("v-timer")[0].reset();
				$("v-timer")[0].start();
				$( 'v-popup' ).show();
				$( 'v-popup' )[0].set_page("recording_page");
				$( 'v-popup' )[0].set_page_status("recording");
			})
			.catch( function () {
				$( 'v-popup' ).show();
				$( 'v-popup' )[0].set_page("microphone_error_page");
			});

		});

		$( document ).on( "reply_button_click", function () {

			$(".ams:contains('Reply')").click();
			setTimeout( function () {
				$('#v_compose_button').click()
			}, 100 );
	
		});

		$( document ).on( "error_cancel_button_click", "#popup", function () {

			$("#popup").hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "error_try_again_button_click", "#popup", function () {

			$( 'v-recorder' )[0].start()
			.then( function () {
				$("v-timer")[0].reset();
				$("v-timer")[0].start();
				$( 'v-popup' ).show();
				$( 'v-popup' )[0].set_page("recording_page");
				$( 'v-popup' )[0].set_page_status("recording");
			})
			.catch( function () {
				$( 'v-popup' ).show();
				$( 'v-popup' )[0].set_page("microphone_error_page");
			});

		});

		$( document ).on( "recording_cancel_button_click", "#popup", function () {

			$( 'v-recorder' )[0].cancel();
			$( 'v-popup' ).hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "recording_done_button_click", "#popup", function () {

			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );

			$("#mini_popup_player")[0].reset();
			$("#mini_popup_player")[0].disable();
			$("#popup").hide();
			$("#mini_popup")[0].reset();
			$("#mini_popup").show();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {

				$( 'v-recorder' )[0].blob_to_data_url( blob )
				.then( function ( data_url ) {

					$("#mini_popup_player")[0].enable();
					$("#mini_popup_player")[0].set_url( data_url );


				});

				$( 'v-recorder' )[0].blob_to_buffer( blob )
				.then( function ( buffer ) {
					$( 'v-uploader' )[0].uploader.upload_buffer( buffer )
					.then( function ( url ) {
						if ( g_state.get_recording_id() === state.get_recording_id() ) {

							g_state.set_audio_url( url );
							$("#mini_popup").hide();
							console.log( "uploaded:", url );

							$("#mini_popup_player")[0].pause();

							$("#letter_manager")[0].add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

							g_state.set_compose_button_id( undefined );

						} else {

							console.log( "aborted recording url:", url )

						}
					})
					.catch();
				});

			})

		});

		$( document ).on( "cancel_click", "#mini_popup", function () {

			$("#mini_popup").hide();

			$("#mini_popup_player")[0].pause();
			g_state.set_recording_id( undefined );
			g_state.set_compose_button_id( undefined );

		});

	} () );
