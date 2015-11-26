
	( function ( $ ) {

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-caret-helper';
		
		proto.attachedCallback = function () {

			var private = {

				element: null,

				constructor: function ( element ) {

					var template = document.getElementById( prefix + '-import' ).import.getElementById( 'template' );
					template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, element.dataset["url_prefix"] );

					element.createShadowRoot().appendChild(
						document.importNode( template.content, true )
					);

					private.element = element;

				}

			};

			var public = {

				get_anchor_node: function () {
					window.getSelection().anchorNode;
				},
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

				}

			};

			private.constructor( this );

			Object.keys( public ).forEach( function ( key ) {
				private.element[ key ] = public[ key ];
			});
			
		};

		document.registerElement( prefix, { prototype: proto } );

	} ( $pmjQuery ) );
	

