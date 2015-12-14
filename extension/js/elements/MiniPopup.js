	
	function MiniPopup ( $, template, element ) {
		
		var private = {
			
			element: null,

			get_dispatcher: function ( event_name ) {
				return function () {
					element.dispatchEvent( new CustomEvent( event_name, { bubbles: true } ) );
				};
			}

		};

		var public = {

			reset: function () {
				$( "#progress", element.shadowRoot ).html("");
			},

			set_state: function ( state ) {

				var options = {

					"uploading": function () {
						$( ".phrase_container", element.shadowRoot ).css({ display: "none" });
						$( "#uploading_phrase_container", element.shadowRoot ).css({ display: "" });
					},

					"uploading_failed": function () {
						$( ".phrase_container", element.shadowRoot ).css({ display: "none" });
						$( "#uploading_failed_phrase_container", element.shadowRoot ).css({ display: "" });
					}

				};

				options[ state ]();

			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( document ).on( "upload_progress", function ( event ) {
				$( "#progress", element.shadowRoot ).html( event.originalEvent.detail.progress + "%" );
			});

			$( "#cancel", element.shadowRoot ).click( private.get_dispatcher( 'cancel_click' ) );
			$( "#try_again", element.shadowRoot ).click( private.get_dispatcher( 'try_again_click' ) );

			$.extend( element, public );

		} () )

		return element;
		
	};
