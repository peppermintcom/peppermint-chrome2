	
	function AllLinksController ( $, hub, peppermint_link_maker, backend_manager ) {
		
		var state = {

		};

		var private = {

			link_to_short_link_id: function ( link ) {

				if ( link.href.indexOf( "https://peppermint.com/" ) > -1 ) {

					return link.href.replace( "https://peppermint.com/", "" ).replace( "/", "" );
	
				} else {

					return false;

				}

			},

			process_a_link: function ( link ) {

				var short_link_id = private.link_to_short_link_id( link );

				if ( short_link_id && !link.peppermint_link_flag ) {

					backend_manager.short_link_id_to_recording_data(
						private.link_to_short_link_id( link )
					).then( function ( data ) {

						peppermint_link_maker.upgrade_link(
							link,
							data.long_url,
							data.transcription
						);

						link.peppermint_link_flag = true;

					});

				}

			},

			process_links: function ( links ) {

				for ( var i = links.length; i--; ) {

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
