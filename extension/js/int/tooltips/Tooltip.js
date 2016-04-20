
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

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { type: 'click', name : 'tooltip', element_id: element.id } } 
				});

			});

			$( "#cross", element.shadowRoot ).on( "click", function () {

				public.remove();

				if ( element.id === "peppermint_compose_button_tooltip" ) {

					chrome.storage.local.set({ compose_button_has_been_used: true });

				}

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { type: 'click', name : 'tooltip', element_id: '#cross' } } 
				});

			});

			if ( window.innerWidth > document.body.clientWidth ) {
				element.classList.add( "shifted_pointer" );
			};

			$.extend( element, public );

		} () )

		return element;

	};


