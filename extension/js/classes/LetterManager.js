
	function LetterManager ( chrome, $, event_hub, sender_data ) {
		
		var state = {

			last_selections: {}
			
		};

		var private = {

				pad: function ( n ) { return n < 10 ? "0" + n : n },

				format_duration: function ( duration ) {
				
					var durationMillis = duration;
					var durationSeconds = parseInt(parseInt(durationMillis)/1000);
					var displayMinutes = parseInt(durationSeconds / 60);
					var displaySeconds = durationSeconds % 60;
					
					returnValue =  private.pad( displayMinutes ) + ':' + private.pad( displaySeconds );
					
					console.log( "Return Value for duration is: " + returnValue);
					
					return returnValue.split( "" ).join( "<span>&#8203;</span>" );

				},

				format_email_message: function ( template, recording_data ) {

					var message = template
					.replace( /{{SHORT_URL}}/g, recording_data.urls.short_url )
					.replace( "{{LONG_URL}}", recording_data.urls.canonical_url )
					.replace( /{{SENDER_NAME}}/g, sender_data.sender_name )
					.replace( /{{SENDER_EMAIL}}/g, sender_data.sender_email )
					.replace( "{{RECORDING_ID}}", recording_data.id )
					.replace( "{{DURATION}}", private.format_duration( recording_data.duration ) )
					.replace( "{{TRANSCRIPT_HEADER}}", "" );

					return message;

				},

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

				selectionchange_handler: function () {

					var selection = window.getSelection();
					var anchor_node = selection.anchorNode;

					$(".I5").each( function ( index, element ) {

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

					});

				}

		};

		var public = {

			add_link: function ( id, recording_data ) {
				 
				try {
					
					var letter = $(".I5[data-id='"+id+"']")[0];
					var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
					var selection = state.last_selections[ letter.dataset.id ];
					duration = private.format_duration( recording_data.duration );
					
					// if element is a child of a dialog - it is a compose message
					if ( $(".I5[data-id='"+id+"']").closest(".nH.Hd").length === 0 ) {

						if ( selection && editable.contains( selection.anchorNode ) ) {
							private.html_before_selection( 
								private.format_email_message( private.reply_template, recording_data ),
								selection
							);
						} else {
							$( editable ).prepend(
								private.format_email_message( private.reply_template, recording_data )
							);
						}

					} else {

						if ( selection && editable.contains( selection.anchorNode ) ) {
							private.html_before_selection(
								private.format_email_message( private.compose_template, recording_data ),
								selection
							);
						} else {
							$( editable ).prepend(
								private.format_email_message( private.compose_template, recording_data )
							)
						};

						if ( $(".I5[data-id='"+id+"'] input[name='subjectbox']").val() === '' ) {
							$(".I5[data-id='"+id+"'] input[name='subjectbox']").val("I sent you an audio message");
						}

					}
					
					$('table.row.player').hide();

				} catch ( error ) {
					
					Raven.captureException( error );

					console.error( error );

				}

			},

			add_recording_data_to_a_letter: function ( recording_data ) {

				var letter = $( "#peppermint_template_" + recording_data.id );

				if ( letter.length > 0 ) {

					if ( recording_data.transcription_data.text ) {

						letter.find( ".transcription_header" ).show();
						letter.find( ".transcription" ).text( recording_data.transcription_data.text );

					} else {

						letter.find( ".transcription_header" ).remove();
						letter.find( ".transcription" ).remove();

					}

					var audio_element = $( "<audio controls ></audio>" )[ 0 ];
					audio_element.src = recording_data.data_url;

					letter.find( ".fake_audio_container" ).append( audio_element );

				}

			}

		};

		( function () {

			$( document ).on( "selectionchange", private.selectionchange_handler );

			$.get( chrome.extension.getURL( '/html/templates/letter.html' ), function( response ) {

				private.compose_template = response;

			});
			
			$.get( chrome.extension.getURL( '/html/templates/letter.html' ), function( response ) {

				private.reply_template = response;

			});
			
			event_hub.fire( 'class_load', { name: 'LetterManager' } );

		} () )

		return public;
	
	};

