	
	function AsanaButtonInserter ( $, hub, button ) {
		
		var state = {

		};

		var private = {

			document_to_container: function ( document ) {

				return $( ".taskCommentsView-toolbar", document )[ 0 ];

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
				"right": "100px",
				"width": "24px",
				"height": "24px",
				"margin-top": "2.5px"
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
