
	( function ( $ ) {
		
		var LetterManager = function () {
			
			var audioFinalTranscription = "";
			var transcriptionDurationDisplay = "";
			var newCompositionTemplate = "";
			var replyCompositionTemplate = "";
			
			
			
			$(document).ready(function() {
				
				$.get('https://s3.amazonaws.com/peppermint-templates/composition-new.html', function(templateNew) {
					newCompositionTemplate = templateNew;
				});
				
				$.get('https://s3.amazonaws.com/peppermint-templates/composition-reply.html', function(templateReply) {
					replyCompositionTemplate = templateReply;
				});
			
			});
			
			document.addEventListener("update_audio_transcription", function(event){
				console.log("update_audio_transcription received");
				audioFinalTranscription = event.detail.transcript;
			});
			
			document.addEventListener("store_audio_duration", function(event){
				console.log("store_audio_duration received");
				
				var durationMillis = event.detail.duration;
				var durationSeconds = parseInt(parseInt(durationMillis)/1000);
				var displayMinutes = parseInt(durationSeconds / 60);
				var displaySeconds = durationSeconds % 60;
				
				transcriptionDurationDisplay = zeroPad(displayMinutes) + ':' + zeroPad(displaySeconds);
			});
			
			function zeroPad(originalNumber) {
				
				numberValue = parseInt(originalNumber);
				
				if (numberValue < 10) {
					return '0' + numberValue;
				}
				
				return '' + numberValue;
			}
			
			
			function formatEmailMessage(audioUrl, audioTranscript, audioDurationDisplay, emailTemplate) {
				
				var transcriptHeader = "MESSAGE TRANSCRIPTION";
				
				if (audioTranscript.trim().length < 1) {
					transcriptHeader = "";
				}
				
				var emailMessage = emailTemplate.replace("{{audio}}", audioUrl)
												.replace("{{transcript_header}}", transcriptHeader)
												.replace("{{transcript}}", audioTranscript)
												.replace("{{duration}}", audioDurationDisplay);
				
				audioFinalTranscription = "";
				
				return emailMessage;
			}
			
			var private = {
				
				last_selections: {},

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

				add_link: function ( url, id ) {
					 
					try {
						
						var letter = $(".I5[data-id='"+id+"']")[0];
						var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
						var selection = private.last_selections[ letter.dataset.id ];

						// if element is a child of a dialog - it is a compose message
						if ( $(".I5[data-id='"+id+"']").closest(".nH.Hd").length === 0 ) {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection( 
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, replyCompositionTemplate),
									selection
								);
							} else {
								$( editable ).prepend(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, replyCompositionTemplate)
								);
							}

						} else {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, newCompositionTemplate),
									selection
								);
							} else {
								$( editable ).prepend(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, newCompositionTemplate)
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

			public.constructor = function ( element ) {

				$( document ).on( "selectionchange", private.selectionchange_handler );

			};

			return public;
			
		};
	

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-letter-manager';

		proto.attachedCallback = function () {

			var element = this;
			var letter_manager = new LetterManager();
			
			Object.keys( letter_manager ).forEach( function ( key ) {
				element[ key ] = letter_manager[ key ];
			});

			letter_manager.constructor( element );

		};

		document.registerElement( prefix, { prototype: proto } );

	} ( $pmjQuery ) );
