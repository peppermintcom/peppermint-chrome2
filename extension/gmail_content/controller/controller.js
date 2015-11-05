
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
				},
				last_selections: {}

			};

			return public;

		};

		var g_state = new State();

		function add_link ( url, id ) {
			
			try {

				if ( g_state.get_reply_initiated() ) {

					var letter = $(".I5[data-id='"+id+"']")[0];
					var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
					var anchor_node = $("v-caret-helper")[0].get_anchor_node();
					var selection = g_state.last_selections[ letter.dataset["id"] ];

					if ( selection ) {
						$("v-caret-helper")[0].html_before_selection( 
							"I'm sending you an audio reply listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
							.replace( "{{URL}}", url )
							.replace( "{{URL}}", url ),
							selection
						);
					} else {
						$( editable ).prepend(
							"I'm sending you an audio reply listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
							.replace( "{{URL}}", url )
							.replace( "{{URL}}", url )
						);
					}

				} else {

					var letter = $(".I5[data-id='"+id+"']")[0];
					var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
					var anchor_node = $("v-caret-helper")[0].get_anchor_node();
					var selection = g_state.last_selections[ letter.dataset["id"] ];

					if ( selection ) {
						$("v-caret-helper")[0].html_before_selection(
							"I've sent you an audio message via Peppermint listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
							.replace( "{{URL}}", url )
							.replace( "{{URL}}", url ),
							selection
						);
					} else {
						$( editable ).prepend(
							"I've sent you an audio message via Peppermint listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
							.replace( "{{URL}}", url )
							.replace( "{{URL}}", url )
						)
					};

					if ( $(".I5[data-id='"+id+"'] input[name='subjectbox']").val() === '' ) {
						$(".I5[data-id='"+id+"'] input[name='subjectbox']").val("I sent you an audio message")
					}

				}

			} catch ( e ) {
				console.error( e );
			}


			g_state.set_reply_initiated( false );

		};

		$( document ).on( "selectionchange", function () {

			var selection = window.getSelection();
			var anchor_node = selection.anchorNode;
			$(".I5").each( function ( index, element ) {

				var editable = $( element ).find(".Am.Al.editable.LW-avf")[0];
				var subject = $( element ).find(".aoD.az6")[0];
				var to_box = $( element ).find(".wO.nr")[0];
				
				if ( editable && editable.contains( anchor_node ) ) {
					g_state.last_selections[ element.dataset["id"] ] = {
						anchorNode: selection.anchorNode,
						anchorOffset: selection.anchorOffset
					};
				} else if ( ( subject && subject.contains( anchor_node ) ) || ( to_box && to_box.contains( anchor_node ) ) ) {
					g_state.last_selections[ element.dataset["id"] ] = undefined;
				}

			});

		});

		$( document ).on( "compose_button_click", function ( event ) {

			if ( g_state.get_compose_button_id() ) return;

			g_state.set_compose_button_id( event.target.dataset["id"] );

			$( 'v-recorder' )[0].audio_recorder.start()
			.then( function ( started ) {
				if ( started ) {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'recording_page';
					$( 'v-popup' )[0].dataset['status'] = 'recording';
					$("v-timer")[0].reset();
					$("v-timer")[0].start();
				} else {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'microphone_error_page';
				}
			});

		});

		$( document ).on( "reply_button_click", function () {
			g_state.set_reply_initiated( true );
			$(".ams:contains('Reply')").click();
			setTimeout( function () {
				$( '#v_compose_button' ).click()
			}, 100 );
	
		});

		$( document ).on( "error_cancel_button_click", "#popup", function () {

			$("#popup").hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "error_try_again_button_click", "#popup", function () {

			$( 'v-recorder' )[0].audio_recorder.start()
			.then( function ( started ) {
				if ( started ) {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'recording_page';
					$( 'v-popup' )[0].dataset['status'] = 'recording';
					$("v-timer")[0].reset();
					$("v-timer")[0].start();
				} else {
					$( 'v-popup' ).show();
					$( 'v-popup' )[0].dataset['page'] = 'microphone_error_page';
				}
			});

		});

		$( document ).on( "recording_cancel_button_click", "#popup", function () {

			$( 'v-recorder' )[0].audio_recorder.cancel();
			$( 'v-popup' ).hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "recording_done_button_click", "#popup", function () {

			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );

			$( 'v-recorder' )[0].audio_recorder.pause();
			$("#popup").hide();
			$("#mini_popup").show();
				
			$( 'v-recorder' )[0].audio_recorder.get_data_url()
			.then( function ( data_url ) {

				$("#mini_popup_player")[0].player.set_url( data_url );

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
					$("#mini_popup").hide();
					console.log( "uploaded:", url );

					$("#mini_popup_player")[0].player.pause();

					add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

					g_state.set_compose_button_id( undefined );

				} else {

					console.log( "aborted recording url:", url )

				}
			})
			.catch();

		});

		$( document ).on( "cancel_click", "#mini_popup", function () {

			$("#mini_popup").hide();

			$("#mini_popup_player")[0].player.pause();
			g_state.set_recording_id( undefined );
			g_state.set_compose_button_id( undefined );

		});

	} () );
