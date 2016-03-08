	
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

			process_a_link: function ( element ) {

				var short_link_id = private.link_to_short_link_id( element );

				if ( short_link_id && !element.dataset.upgraded ) {

					backend_manager.short_link_id_to_recording_data(
						private.link_to_short_link_id( element )
					).then( function ( data ) {

						peppermint_link_maker.upgrade_link(
							element,
							data.long_url,
							data.transcription
						);

						element.dataset.upgraded = true;

					});

				}

			},

			mutation_observer:  function ( mutations ) {

				for ( var i = mutations.length; i--; ) {

					if ( mutations[ i ].type = "childList" ) {

						for ( var j = mutations[ i ].addedNodes.length; j--; ) {

							if ( $( mutations[ j ].addedNodes[ j ] ).is( "a" ) ) {

								private.process_a_link( mutations[ j ].addedNodes[ j ] );								

							} else {

								$( "a", mutations[ j ].addedNodes[ j ] ).each( function ( index, element ) {

									private.process_a_link( element );

								});

							}

						};

					}

				}

			},

		};

		( function () {

			var observer = new MutationObserver( private.mutation_observer );

			observer.observe( document.body, {

				childList: true,
				attributes: false,
				characterData: false,
				subtree: true,
				attributeOldValue: false

			});

			$( "a" ).each( function ( index, element ) {

				private.process_a_link( element );

			});

		} () )

	}
