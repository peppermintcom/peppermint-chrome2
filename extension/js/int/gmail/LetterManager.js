
	function LetterManager ( chrome, $, hub, sender_data ) {
		
		var state = {

			last_selections: {},
			letter_template: "",
			
		};

		var conv = {

			ts_to_duration: function ( ts ) {

				function pad ( n ) { return n > 9 ? n : '0' + n };

				var duration = "";
				var seconds = parseInt( ts / 1000 );
				var minutes = parseInt( seconds / 60 );

				seconds = seconds % 60;
				duration = pad( minutes ) + ':' + pad( seconds );
				duration = duration.split( "" ).join( "<span>&#8203;</span>" );

				return duration;

			},

			template_to_letter: function ( template, recording_data ) {

				var letter = template
				.replace( /{{SHORT_URL}}/g, recording_data.urls.short_url )
				.replace( "{{LONG_URL}}", recording_data.urls.canonical_url )
				.replace( /{{SENDER_NAME}}/g, sender_data.sender_name )
				.replace( /{{SENDER_EMAIL}}/g, sender_data.sender_email )
				.replace( /{{RECORDING_ID}}/g, recording_data.id )
				.replace( "{{DURATION}}", conv.ts_to_duration( recording_data.duration ) )
				.replace( "{{TRANSCRIPT_HEADER}}", "" );

				return letter;

			}

		};

		var proc = {

			html_before_selection: function ( html, selection ) {

				var anchorNode;
				var container_div = document.createElement( 'div' );
				
				if ( typeof selection.anchorNode.splitText === 'function' ) {
					anchorNode = selection.anchorNode;
					anchorNode.splitText( selection.anchorOffset );
					anchorNode = anchorNode.nextSibling;
				} else {
					anchorNode = selection.anchorNode;
				}

				container_div.innerHTML = html;
				var nodes = container_div.childNodes;

				while ( nodes.length ) {
					anchorNode.parentNode.insertBefore( nodes[0], anchorNode );
				}

			},

			add_link: function ( id, recording_data ) {

				if ( id ) {

					var letter = $(".I5[data-id='"+id+"']")[0];

				} else {

					var letter = $(".I5")[0];
					
				}

				var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
				var selection = state.last_selections[ letter.dataset.id ];
				duration = conv.ts_to_duration( recording_data.duration );
				
				if ( selection && editable.contains( selection.anchorNode ) ) {
					
					proc.html_before_selection( 
						conv.template_to_letter( state.letter_template, recording_data ),
						selection
					);
					
				} else {
					
					$( editable ).prepend(
						conv.template_to_letter( state.letter_template, recording_data )
					);
					
				}

				$('table.row.player').hide();

			},

			add_recording_data_to_a_letter: function ( id, recording_data ) {

				// add the transcription
				if ( id ) {

					var subject = $(".I5[data-id='"+id+"'] input[name='subjectbox']");

				} else {
					
					var subject = $(".I5 input[name='subjectbox']");

				}

				var val = subject.val();
				
				if ( val === '' || val === "I sent you an audio message" ) {

					var text = recording_data.transcription_data.text;

					if ( text ) {

						if ( text.length > 55 ) {

							var text = text.slice( 0, 55 ).split( /\s/g ).slice( 0, -1 ).join( " " );

							subject.val( "Audio message: " + text + "..." );

						} else {

							subject.val( "Audio message: " + text );

						}

					} else {

						subject.val("I sent you an audio message");
						
					}

				
				}

				// add the audio player
				var letter = $( "#peppermint_template_" + recording_data.id );

				if ( letter.length > 0 ) {

					if ( recording_data.transcription_data.text ) {

						letter.find( ".transcript-header" ).show();
						letter.find( ".transcript" ).text( recording_data.transcription_data.text );

					} else {

						letter.find( ".transcript-header" ).remove();
						letter.find( ".transcript" ).remove();

					}

					var audio_element = $( "<audio controls ></audio>" )[ 0 ];

					if ( recording_data.data_url ) {

						audio_element.src = recording_data.data_url;
						
					} else {

						audio_element.src = recording_data.urls.canonical_url;
						
					}

					letter.find( "table[alt='buttons']" ).after( audio_element );

				}

			}

		};

		var handle = {

			selectionchange: function () {

				var selection = window.getSelection();
				var anchor_node = selection.anchorNode;

				$(".I5").each( function ( index, element ) {

					if ( element ) {

						var editable = $( element ).find(".Am.Al.editable.LW-avf")[0];
						var subject = $( element ).find(".aoD.az6")[0];
						var to_box = $( element ).find(".wO.nr")[0];
						
						if ( editable && editable.contains( anchor_node ) && anchor_node !== editable ) {
							state.last_selections[ element.dataset.id ] = {
								anchorNode: selection.anchorNode,
								anchorOffset: selection.anchorOffset
							};
						} else if (
							( subject && subject.contains( anchor_node ) ) ||
							( to_box && to_box.contains( anchor_node ) ) 
						) {
							state.last_selections[ element.dataset.id ] = undefined;
						}

					}

				});
				
			},

			start: function () {

				$.get( chrome.extension.getURL( '/html/templates/letter.html' ), function( response ) {

					state.letter_template = response;

				});

				chrome.storage.local.get( [ "send_on_gmail_rec_data_id" ], function ( items ) {

					var rec_id = items[ "send_on_gmail_rec_data_id" ];

					if ( rec_id ) {

						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "rec_id_to_rec_data", rec_id }, function ( rec_data ) {

							var interval = window.setInterval( function () {
						
								if ( $( ".I5 .Am.Al.editable.LW-avf" ).length > 0 ) {

									window.clearInterval( interval );						
									proc.add_link( 0, rec_data );
									proc.add_recording_data_to_a_letter( 0, rec_data );
						
								}
						
							}, 100 );

						});

					}

					chrome.storage.local.set({ send_on_gmail_rec_data_id: false });

				});

			},

			got_recording_urls: function ( data ) {

				proc.add_link( data.compose_window_id, data.recording_data );

			},

			got_recording_audio: function ( data ) {

				proc.add_recording_data_to_a_letter( data.compose_window_id, data.recording_data );

			}

		};

		( function () {

			$( document ).on( "selectionchange", handle.selectionchange );

			hub.add({
				
				start: handle.start,
				got_recording_urls: handle.got_recording_urls,
				got_recording_audio: handle.got_recording_audio

			});
			
		} () );

	};

