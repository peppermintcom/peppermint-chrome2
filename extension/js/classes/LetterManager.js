
	var LetterManager = function ( $, document ) {
		
		var private = {
				
				last_selections: {},

				zeroPad: function ( originalNumber ) {
					
					numberValue = parseInt(originalNumber);
					
					if (numberValue < 10) {
						return '0' + numberValue;
					}
					
					return '' + numberValue;
				},

				format_duration: function ( duration ) {
				
					var durationMillis = duration;
					var durationSeconds = parseInt(parseInt(durationMillis)/1000);
					var displayMinutes = parseInt(durationSeconds / 60);
					var displaySeconds = durationSeconds % 60;
					
					return private.zeroPad( displayMinutes ) + ':' + private.zeroPad( displaySeconds );

				},

				formatEmailMessage: function ( audioUrl, audioTranscript, audioDurationDisplay, emailTemplate ) {
					
					var emailMessage = emailTemplate
					.replace("{{audio}}", audioUrl)
					.replace("{{transcript}}", audioTranscript)
					.replace("{{duration}}", audioDurationDisplay);
					
					return emailMessage;

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
							private.last_selections[ element.dataset.id ] = {
								anchorNode: selection.anchorNode,
								anchorOffset: selection.anchorOffset
							};
						} else if (
							( subject && subject.contains( anchor_node ) ) ||
							( to_box && to_box.contains( anchor_node ) ) 
						) {
							private.last_selections[ element.dataset.id ] = undefined;
						}

					});

				}

		};

		var public = {

				add_link: function ( url, id, transcript, duration ) {
					 
					try {
						
						var letter = $(".I5[data-id='"+id+"']")[0];
						var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
						var selection = private.last_selections[ letter.dataset.id ];
						duration = private.format_duration( duration );

						// if element is a child of a dialog - it is a compose message
						if ( $(".I5[data-id='"+id+"']").closest(".nH.Hd").length === 0 ) {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection( 
									private.formatEmailMessage( url, transcript, duration, private.reply_template ),
									selection
								);
							} else {
								$( editable ).prepend(
									private.formatEmailMessage( url, transcript, duration, private.reply_template )
								);
							}

						} else {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection(
									private.formatEmailMessage( url, transcript, duration, private.compose_template ),
									selection
								);
							} else {
								$( editable ).prepend(
									private.formatEmailMessage( url, transcript, duration, private.compose_template )
								)
							};

							if ( $(".I5[data-id='"+id+"'] input[name='subjectbox']").val() === '' ) {
								$(".I5[data-id='"+id+"'] input[name='subjectbox']").val("I sent you an audio message");
							}

						}

					} catch ( e ) {

						console.error( e );

					}

				}

		};

		( function constructor () {

				$( document ).on( "selectionchange", private.selectionchange_handler );

				$.get( 'https://s3.amazonaws.com/peppermint-templates/composition-new.html', function( response ) {

					private.compose_template = response;

				});
				
				$.get( 'https://s3.amazonaws.com/peppermint-templates/composition-reply.html', function( response ) {

					private.compose_template = response;

				});

		} () )

		return public;
	
	};

