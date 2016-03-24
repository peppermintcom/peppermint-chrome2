	
	function AllLinksController ( $, hub, pep_link_addon_factory, backend_manager ) {
		
		var state = {

			peppermint_links: []

		};

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

				if ( short_link_id && state.peppermint_links.indexOf( link ) === -1 ) {						

					state.peppermint_links.push( link );

					backend_manager.short_url_to_recording_data( link.href ).then( function ( data ) {

						link.classList.add( "peppermint_link" );

						var pep_link_addon = pep_link_addon_factory.make_addon( link, data.data[0].attributes.secure_url, data.data[0].attributes.transcription );
						link.pep_link_addon = pep_link_addon;

						document.body.appendChild( pep_link_addon );

						chrome.runtime.sendMessage( { 
							receiver: 'GlobalAnalytics', name: 'track_analytic', 
							analytic: { name: 'setup', val: { 
								name: 'link_controller',
								action: 'link_added',
								url: link.href } } 
						);

					}).catch( function ( error ) {

						console.log( "Peppermint link is not valid" );

					});

				}

			},

			process_links: function ( links ) {

				var length = links.length;

				for ( var i = 0; i < length; i++ ) {

					private.process_a_link( links[ i ] );

				}

			},

			downgrade_removed_links: function () {

				for ( var i = state.peppermint_links.length; i--; ) {

					if ( !$.contains( document, state.peppermint_links[ i ] ) ) {

						if ( state.peppermint_links[ i ].pep_link_addon ) {

							state.peppermint_links[ i ].pep_link_addon.remove();
							state.peppermint_links[ i ] = false;

						}

					}

				};

				state.peppermint_links = state.peppermint_links.filter( function ( a ) { return a } );

			}

		};

		( function () {

			private.process_links( document.getElementsByTagName( "a" ) );

			var interval = setInterval( function () {
		
				private.process_links( document.getElementsByTagName( "a" ) );

				private.downgrade_removed_links();
		
			}, 50 );

		} () )

	}
