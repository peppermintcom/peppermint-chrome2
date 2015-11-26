
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

				reset: function () {
					$( "#progress", private.element.shadowRoot ).html("");
				},

				set_state: function ( state ) {

					var options = {

						"uploading": function () {
							$( ".phrase_container", private.element.shadowRoot ).css({ display: "none" });
							$( "#uploading_phrase_container", private.element.shadowRoot ).css({ display: "" });
						},

						"uploading_failed": function () {
							$( ".phrase_container", private.element.shadowRoot ).css({ display: "none" });
							$( "#uploading_failed_phrase_container", private.element.shadowRoot ).css({ display: "" });
						}

					};

					options[ state ]();

				}

			};

			public.constructor = function ( element ) {

				private.element = element;

				$( document ).on( "upload_progress", function ( event ) {
					$( "#progress", element.shadowRoot ).html( event.originalEvent.detail.progress + "%" );
				});

				$( "#cancel", element.shadowRoot ).click( private.get_dispatcher( 'cancel_click' ) );
				$( "#try_again", element.shadowRoot ).click( private.get_dispatcher( 'try_again_click' ) );
			
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
	