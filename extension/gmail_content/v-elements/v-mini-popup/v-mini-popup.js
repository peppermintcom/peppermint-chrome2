
	( function () {
		
		var MiniPopup = function ( element ) {
			
			var private = {
				
				element: null,

				get_dispatcher: function ( event_name ) {
					return function () {
						private.element.dispatchEvent( new CustomEvent( event_name, { bubbles: true } ) );
					}
				}

			};

			var public = {


			};

			public.constructor = function ( element ) {

				private.element = element;

				$( "#cancel", element.shadowRoot ).click( private.get_dispatcher( 'cancel_click' ) );
			
			};

			return public;
			
		};
	

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-mini-popup';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( 'template' );
		
		proto.attachedCallback = function () {

			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);

			var element = this;
			var mini_popup = new MiniPopup();

			Object.keys( mini_popup ).forEach( function ( key ) {
				element[ key ] = mini_popup[ key ];
			});

			mini_popup.constructor( element );
			
		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	