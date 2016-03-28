	
	function AsanaButtonInserter ( $, hub, button ) {
		
		var state = {

		};

		var private = {

			document_to_container: function ( document ) {

				return $( "#details_property_sheet__new_comment_button .new-button-text", document )[ 0 ];

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
				"display": "block",
				"position": "absolute",
				"top": "-5px",
				"left": "-42px",
				"width": "24px",
				"height": "24px"
			});

			$( button ).on( "click", button.toggle );

			( function tick () {

				var container = private.document_to_container( document );

				if ( container ) {

					var rect = container.getBoundingClientRect();
					$( button ).css({ transform: "translate( Xpx, Ypx )".replace( "X", rect.left ).replace( "Y", rect.top ) });
					$( button ).show();

				} else {

					$( button ).hide();

				}

				requestAnimationFrame( tick );

			} () )

		} () )

	}
