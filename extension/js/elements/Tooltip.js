
	function Tooltip ( $, template, element, img_url, event_hub ) {

		var private = {

			stopped: false

		};

		var public = {

			stick_to: function ( target_selector ) {

				setInterval( function () {

					if ( $( target_selector ).length > 0 && private.stopped === false ) {
					
						$( element ).css( $( target_selector ).offset() );
						$( element ).show();

					} else {

						$( element ).hide();

					}

				}, 50 );

			},

			stop: function () {

				private.stopped = true;

			}

		};

		( function constructor () {

			template.innerHTML = template.innerHTML.replace( /{{IMG_URL}}/g, img_url );
			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( element ).on( "click", function ( event ) {

				event.stopPropagation();

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				$( element ).hide();
				event_hub.fire( "tooltip_close_button_click" )

			});

			$.extend( element, public );

		} () )

		return element;

	};


