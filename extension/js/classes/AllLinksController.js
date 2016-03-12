	
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
						
					link.peppermint_link_flag = true;

					backend_manager.short_url_to_recording_data( link.href ).then( function ( data ) {

						peppermint_link_maker.upgrade_link(
							link,
							data.data[0].attributes.secure_url,
							data.data[0].attributes.transcription
						);

					}).catch( function ( error ) {
						console.log( error );
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
