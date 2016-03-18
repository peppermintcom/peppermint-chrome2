
	function LetterManager ( $, document, chrome, sender_data, utilities ) {
		
		var private = {
				
				last_selections: {},

                add_metric: function ( metric, log_result ){
                    
                    if(!utilities)
                        utilities = new Utilities( chrome, $, 'LetterManager' );
                        
                    utilities.add_metric( metric, function ( result ) {
                        if(log_result)
                            console.log({ metric, result });
                    });
                },

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
					
					returnValue =  private.zeroPad( displayMinutes ) + ':' + private.zeroPad( displaySeconds );
					
					console.log("Return Value for duration is: " + returnValue);
					
					return returnValue.split( "" ).join( "<span>&#8203;</span>" );

				},

				formatEmailMessage: function ( audioUrls, transcript, audioDurationDisplay, emailTemplate, recording_id ) {

					var emailMessage = emailTemplate
					.replace( /{{SHORT_URL}}/g, audioUrls.short_url )
                    .replace( "{{LONG_URL}}", audioUrls.cloudfront_ssl_url )
                    .replace( "{{OBJECT_URL}}", audioUrls.object_url )
					.replace( "{{TRANSCRIPT}}", transcript )
					.replace( /{{SENDER_NAME}}/g, sender_data.sender_name )					
					.replace( /{{SENDER_EMAIL}}/g, sender_data.sender_email )					
					.replace( "{{RECORDING_ID}}", recording_id )
					.replace( "{{DURATION}}", audioDurationDisplay );

					if ( transcript ) {

						emailMessage = emailMessage.replace( "{{TRANSCRIPT_HEADER}}", "MESSAGE TRANSCRIPTION" );
					
					} else {

						emailMessage = emailMessage.replace( "{{TRANSCRIPT_HEADER}}", "" );

					} 
					
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

				add_link: function ( urls, id, transcript, duration, recording_id ) {
					 
					try {
						
						var letter = $(".I5[data-id='"+id+"']")[0];
						var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
						var selection = private.last_selections[ letter.dataset.id ];
						duration = private.format_duration( duration );
						
						// if element is a child of a dialog - it is a compose message
						if ( $(".I5[data-id='"+id+"']").closest(".nH.Hd").length === 0 ) {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection( 
									private.formatEmailMessage( urls, transcript, duration, private.reply_template, recording_id ),
									selection
								);
							} else {
								$( editable ).prepend(
									private.formatEmailMessage( urls, transcript, duration, private.reply_template, recording_id )
								);
							}

						} else {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection(
									private.formatEmailMessage( urls, transcript, duration, private.compose_template, recording_id ),
									selection
								);
							} else {
								$( editable ).prepend(
									private.formatEmailMessage( urls, transcript, duration, private.compose_template, recording_id )
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

				}

		};

		( function constructor () {

			$( document ).on( "selectionchange", private.selectionchange_handler );

			$.get( chrome.extension.getURL( '/html/templates/letter.html' ), function( response ) {

				private.compose_template = response;

			});
			
			$.get( chrome.extension.getURL( '/html/templates/letter.html' ), function( response ) {

				private.reply_template = response;

			});
            
            private.add_metric({ name: 'class-load', val: { class: 'LetterManager' } });

		} () )

		return public;
	
	};

