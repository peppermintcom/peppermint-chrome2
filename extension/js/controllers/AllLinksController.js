	
	function AllLinksController ( $, hub, pep_link_addon_factory ) {

		var private = {

			link_to_short_link_id: function ( link ) {

				if ( link.href.indexOf( "https://peppermint.com/" ) > -1 && link.href.indexOf( "reply" ) === -1 ) {

					return link.href.replace( "https://peppermint.com/", "" ).replace( "/", "" );
	
				} else {

					return false;

				}

			},

			process_a_link: function ( link ) {

				var short_link_id = private.link_to_short_link_id( link );

				if ( short_link_id && !link.pep_link_addon ) {						

					link.pep_link_addon = pep_link_addon_factory.make_addon( link );

				}

			},

			process_links: function ( links ) {

				var length = links.length;

				for ( var i = 0; i < length; i++ ) {

					private.process_a_link( links[ i ] );

				}

			}

		};

		( function () {

			private.process_links( document.getElementsByTagName( "a" ) );

			var interval = setInterval( function () {
		
				private.process_links( document.getElementsByTagName( "a" ) );

			}, 50 );

		} () )

	}
