	
	function SlackButtonInserter ( $, hub, button ) {
		
		var state = {

		};

		var private = {

			document_to_container: function ( document ) {

				return $( "#message-form", document )[ 0 ];

			},

			container_has_button: function ( container ) {
				
				return container.dataset.has_button === "1";

			},

			insert_button: function ( container, button ) {
				
				container.dataset.has_button = "1";
				container.appendChild( button );

			}

		};

		( function () {

			$( button ).css({
				"display": "none",
				"position": "absolute",
				"right": "35px",
				"width": "19px",
				"height": "19px",
				"margin-top": "11px",
				"opacity": "0.5"
			});

			( function tick () {

				var container = private.document_to_container( document );

				if ( container && !private.container_has_button( container ) ) {

					private.insert_button( container, button );
					$( button ).show();

				}

				requestAnimationFrame( tick );

			} () )

		} () )

	}
