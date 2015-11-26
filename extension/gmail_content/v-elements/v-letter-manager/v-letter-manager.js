
	( function ( $ ) {
		
		var LetterManager = function () {
			
			var private = {
				
				last_selections: {},

				html_before_selection: function ( html, selection ) {

					var container_div = document.createElement( 'div' );
					
					if ( typeof selection.anchorNode.splitText === 'function' ) {
						var anchorNode = selection.anchorNode;
						anchorNode.splitText( selection.anchorOffset );
						anchorNode = anchorNode.nextSibling;
					} else {
						var anchorNode = selection.anchorNode;
					}

					container_div.innerHTML = html;
					var nodes = container_div.childNodes;

					while ( nodes.length ) {
						anchorNode.parentNode.insertBefore( nodes[0], anchorNode );
					};

				},

				selectionchange_handler: function () {

					var selection = window.getSelection();
					var anchor_node = selection.anchorNode;

					$(".I5").each( function ( index, element ) {

						var editable = $( element ).find(".Am.Al.editable.LW-avf")[0];
						var subject = $( element ).find(".aoD.az6")[0];
						var to_box = $( element ).find(".wO.nr")[0];
						
						if ( editable && editable.contains( anchor_node ) && anchor_node !== editable ) {
							private.last_selections[ element.dataset["id"] ] = {
								anchorNode: selection.anchorNode,
								anchorOffset: selection.anchorOffset
							};
						} else if (
							( subject && subject.contains( anchor_node ) ) ||
							( to_box && to_box.contains( anchor_node ) ) 
						) {
							private.last_selections[ element.dataset["id"] ] = undefined;
						}

					});

				}

			};

			var public = {

				add_link: function ( url, id ) {

					try {

						// if element is a child of a dialog - it is a compose message
						if ( $(".I5[data-id='"+id+"']").closest(".nH.Hd").length === 0 ) {

							var letter = $(".I5[data-id='"+id+"']")[0];
							var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
							var selection = private.last_selections[ letter.dataset["id"] ];

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection( 
									"I sent you an audio reply. Listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
									.replace( "{{URL}}", url )
									.replace( "{{URL}}", url ),
									selection
								);
							} else {
								$( editable ).prepend(
									"I sent you an audio reply. Listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
									.replace( "{{URL}}", url )
									.replace( "{{URL}}", url )
								);
							}

						} else {

							var letter = $(".I5[data-id='"+id+"']")[0];
							var editable = $( letter ).find('.Am.Al.editable.LW-avf')[0];
							var selection = private.last_selections[ letter.dataset["id"] ];

							if ( selection && editable.contains( selection.anchorNode ) ) {
								private.html_before_selection(
									"I've sent you an audio message via Peppermint. Listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
									.replace( "{{URL}}", url )
									.replace( "{{URL}}", url ),
									selection
								);
							} else {
								$( editable ).prepend(
									"I've sent you an audio message via Peppermint. Listen here: <br> <a href='{{URL}}' >{{URL}}</a><br>"
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

		}

		document.registerElement( prefix, { prototype: proto } );

	} ( $pmjQuery ) );
