
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
				},
				get_reply_initiated: function () {
					return private.reply_initiated;
				},
				set_reply_initiated: function ( reply_initiated ) {
					private.reply_initiated = reply_initiated;
				}

			};

			return public;

		};

		var g_state = new State();

		function add_link ( url, id ) {
			
			if ( g_state.get_reply_initiated() ) {
				$(".I5[data-id='"+id+"']").find('.Am.Al.editable.LW-avf').append(
					"<br>I'm sending you an audio reply listen here: <br> <a href='{{URL}}' >{{URL}}</a>"
					.replace( "{{URL}}", url )
					.replace( "{{URL}}", url )
				)
			} else {
				$(".I5[data-id='"+id+"']").find('.Am.Al.editable.LW-avf').append(
					"<br>I've sent you an audio message via Peppermint listen here: <br> <a href='{{URL}}' >{{URL}}</a>"
					.replace( "{{URL}}", url )
					.replace( "{{URL}}", url )
				)
				if ( $(".I5[data-id='"+id+"'] input[name='subjectbox']").val() === '' ) {
					$(".I5[data-id='"+id+"'] input[name='subjectbox']").val("I sent you an audio message")
				}
			}

			g_state.set_reply_initiated( false );

		};

		$( document ).on( "compose_button_click", function ( event ) {

			if ( g_state.get_compose_button_id() ) return;

			g_state.set_compose_button_id( event.target.dataset["id"] );

			$( 'v-recorder' )[0].audio_recorder.start()
			.then( function ( started ) {
				if ( started ) {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'recording_page';
					$( 'v-popup' )[0].dataset['status'] = 'recording';
				} else {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'microphone_error_page';
				}
			});

		});

		$( document ).on( "error_try_again_button_click", function () {

			$( 'v-recorder' )[0].audio_recorder.start()
			.then( function ( started ) {
				if ( started ) {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'recording_page';
					$( 'v-popup' )[0].dataset['status'] = 'recording';
				} else {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'microphone_error_page';
				}
			});

		});

		$( document ).on( "recording_cancel_button_click", function () {

			$( 'v-recorder' )[0].audio_recorder.cancel();
			$( 'v-popup' ).hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "error_cancel_button_click", function () {

			$( 'v-popup' ).hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "recording_done_button_click", function () {

			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );

			$( 'v-recorder' )[0].audio_recorder.pause();
			$( 'v-popup' )[0].dataset['page'] = 'uploading_page';
			$( 'v-popup' )[0].dataset['status'] = 'uploading';
				
			$( 'v-recorder' )[0].audio_recorder.get_data_url()
			.then( function ( data_url ) {

				$("v-player")[0].player.set_url( data_url );

				return new Promise( function ( resolve ) { resolve() });

			})
			.then( $( 'v-recorder' )[0].audio_recorder.get_buffer )
			.then( function ( buffer ) {

				$( 'v-recorder' )[0].audio_recorder.cancel()

				return new Promise( function ( resolve ) { resolve( buffer ) });

			})
			.then( $( 'v-uploader' )[0].uploader.upload_buffer )
			.then( function ( url ) {
				if ( g_state.get_recording_id() === state.get_recording_id() ) {
					g_state.set_audio_url( url );
					$( 'v-popup' )[0].dataset['status'] = 'uploaded';
					console.log( "uploaded:", url );
				} else {
					console.log( "aborted recording url:", url )
				}
			})
			.catch();

		});

		$( document ).on( "uploading_re_record_button_click", function () {

			$("v-player")[0].player.pause();
			$( 'v-recorder' )[0].audio_recorder.start();
			$( 'v-popup' )[0].dataset['page'] = 'recording_page';
			$( 'v-popup' )[0].dataset['status'] = 'recording';

		});

		$( document ).on( "uploading_done_button_click", function () {

			$("v-player")[0].player.pause();
			$( 'v-popup' ).hide();
			add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );
			g_state.set_compose_button_id( undefined );


		});

		$( document ).on( "reply_button_click", function () {
			g_state.set_reply_initiated( true );
			$(".ams:contains('Reply')").click();
			setTimeout( function () {
				$( '#v_compose_button' ).click()
			}, 100 );
		});

	} () );
