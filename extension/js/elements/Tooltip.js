
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

						    event_hub.fire( "setup", { class: "Tooltip", function: "stick_to", element: target_selector, status: 'shown' } );

                        }

					} else {
                        
                        if ($(element).is(':visible') ){
                            
                            $( element ).hide();

                            event_hub.fire( "setup", { class: "Tooltip", function: "stick_to", element: target_selector, status: 'hidden' } );

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

				event_hub.fire( "user_click", { class: 'tooltip', function: 'click', element_id: element.id } );

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				$( element ).hide();
				event_hub.fire( "tooltip_close_button_click" );
				event_hub.fire( "user_click", { class: 'tooltip', function: 'cross-click', action: 'tooltip_close_button_click' } );

			});

			$.extend( element, public );

			event_hub.fire( "class_load", { name : "Tooltip" } );

		} () )

		return element;

	};


