
	function Tooltip ( $, event_hub, template, element ) {

		var private = {

			stopped: false

		};

		var public = {

			stick_to: function ( target_selector ) {

				setInterval( function () {

					if ( $( target_selector ).length > 0 && private.stopped === false ) {
					
                        if (!$(element).is(':visible') ){
                            
                            $( element ).css( $( target_selector ).offset() );
						    $( element ).show();

                        }

					} else {
                        
                        if ($(element).is(':visible') ){
                            
                            $( element ).hide();

                        }

					}

				}, 50 );

			},

			stop: function () {

				private.stopped = true;

			}

		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( element ).on( "click", function ( event ) {

				event.stopPropagation();

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				$( element ).hide();
				event_hub.fire( "tooltip_close_button_click" );

			});

			$.extend( element, public );

		} () )

		return element;

	};


