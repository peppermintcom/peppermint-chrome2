
	( function ( $ ) {
		
		var LetterManager = function () {
			
			var audioFinalTranscription = "";
			var transcriptionDurationDisplay = "";
			
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
				
				transcriptionDurationDisplay = displayMinutes + ' min ' + displaySeconds + ' secs';
			});
			
			function formatEmailMessage(audioUrl, audioTranscript, audioDurationDisplay, audioMessageType) {
				
				var emailMessage = "--- Audio {{MESSAGE_TYPE}} ({{MESSAGE_DURATION}}) ---"
				    .replace( "{{MESSAGE_TYPE}}", audioMessageType )
				    .replace( "{{MESSAGE_DURATION}}", audioDurationDisplay ) + 
					'<br>' + 
					"<br><a href='{{URL}}' >{{URL}}</a>".replace( "{{URL}}", audioUrl ).replace( "{{URL}}", audioUrl ) + 
					'<br><br>' + 
					'--- Transcription Below ---' + 
					'<br><br>' + 
					audioTranscript + '<br><br>' + 
					"<a href='https://peppermint.com/reply' >Peppermint Quick Reply</a>";
				
				console.log(emailMessage);
				
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
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, 'Reply'),
									selection
								);
							} else {
								$( editable ).prepend(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, 'Reply')
								);
							}

						} else {

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, 'Message'),
									selection
								);
							} else {
								$( editable ).prepend(
									formatEmailMessage(url, audioFinalTranscription, transcriptionDurationDisplay, 'Message')
								);
							}

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
