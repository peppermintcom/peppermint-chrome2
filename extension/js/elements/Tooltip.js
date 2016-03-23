
	function Tooltip ( $, event_hub, template, element ) {

		var private = {

			removed: false

		};

		var public = {

			stick_to: function ( target_selector ) {

				( function tick () {

					if ( $( target_selector ).length ) {
							
						$( element ).css( $( target_selector ).offset() );
						$( element ).show();

					} else {
						
						$( element ).hide();

					}

					if ( !private.removed ) requestAnimationFrame( tick );

				} () );

			},

			remove: function () {

				private.removed = true;
				$( element ).remove()

			}

		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( element ).on( "click", function ( event ) {

				event.stopPropagation();

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				public.remove();

			});

			if ( window.innerWidth > document.body.clientWidth ) {
				element.classList.add( "shifted_pointer" );
			};

			$.extend( element, public );

		} () )

		return element;

	};


