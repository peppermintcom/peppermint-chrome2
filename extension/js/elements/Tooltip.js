
	function Tooltip ( $, template, element, img_url, event_hub, utilities ) {

		var private = {

			stopped: false,
            
            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'Tooltip' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            }

		};

		var public = {

			stick_to: function ( target_selector ) {

				setInterval( function () {

					if ( $( target_selector ).length > 0 && private.stopped === false ) {
					
                        if (!$(element).is(':visible') ){
                            
                            $( element ).css( $( target_selector ).offset() );
						    $( element ).show();
                            
                            private.add_metric({ 
                                name: 'setup', 
                                val: { class: 'Tooltip', function: 'stick_to', element: target_selector, status: 'shown' }
                            });
                        }

					} else {
                        
                        if ($(element).is(':visible') ){
                            
                            $( element ).hide();
                            
                            private.add_metric({ 
                                name: 'setup', 
                                val: { class: 'Tooltip', function: 'stick_to', element: target_selector, status: 'hidden' }
                            });
                        }

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
                
                private.add_metric({ 
                    name: 'user-click', 
                    val: { class: 'tooltip', function: 'click', element: element.id }
                });

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				$( element ).hide();
				event_hub.fire( "tooltip_close_button_click" );
                                    
                private.add_metric({ 
                    name: 'user-click', 
                    val: { class: 'tooltip', function: 'cross-click', element: element.id, action: 'tooltip_close_button_click' }                     
                });

			});

			$.extend( element, public );
            
            private.add_metric({ name: 'class-load', val: { class: 'Tooltip' } });

		} () )

		return element;

	};


