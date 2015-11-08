
	( function ( document, $ ) {

		$("#popup").css({ display: "block" }).show();
		$("#popup")[0].set_page("popup_welcome");

		var state = {};

		function begin_recording () {

			state.recording_thread_id = Date.now();

			$("#recorder")[0].start()
			.then( function () {
				$("#timer")[0].reset();
				$("#timer")[0].start();
				$("#popup").show();
				$("#popup")[0].set_page("recording_page");
				$("#popup")[0].set_page_status("recording");
			})
			.catch( function () {
				$("#popup").show();
				$("#popup")[0].set_page("microphone_error_page");
			});

		};

		$( document ).on( "popup_welcome_start_recording_click", "#popup", function () {

			begin_recording();

		});

		$( document ).on( "error_cancel_button_click", "#popup", function () {

			$("#popup")[0].set_page("popup_welcome");
			state.recording_thread_id = Date.now();

		});

		$( document ).on( "error_try_again_button_click", "#popup", function () {

			begin_recording();

		});

		$( document ).on( "recording_cancel_button_click", "#popup", function () {

			$('#recorder')[0].cancel();
			$("#popup")[0].set_page("popup_welcome");
			state.recording_thread_id = Date.now();

		});

		$( document ).on( "recording_done_button_click", "#popup", function () {

			current_recording_thread_id = state.recording_thread_id;
				
			$("#recorder")[0].finish()
			.then( function ( blob ) {

				$("#recorder")[0].blob_to_data_url( blob )
				.then( function ( data_url ) {

					console.log( data_url );

					$("#player")[0].player.set_url( data_url );
					$("#popup")[0].set_page_status("uploading");
					$("#popup")[0].set_page("uploading_page");

				});

				$("#recorder")[0].blob_to_buffer( blob )
				.then( function ( buffer ) {
					$("#uploader")[0].uploader.upload_buffer( buffer )
					.then( function ( url ) {
						if ( current_recording_thread_id === state.recording_thread_id ) {

							console.log( "uploaded:", url );
							$("#popup")[0].set_page_status("finished");
							$("#popup")[0].set_page("popup_finish");
							$("#popup")[0].set_url( url );
					
							$("#player")[0].player.pause();

						} else {

							console.log( "aborted recording url:", url )

						}
					})
					.catch();
				});

			})

		});

		$( document ).on( "popup_finish_start_new_button_click", "#popup", function () {

			begin_recording();

		});



	} ( document, jQuery ) )