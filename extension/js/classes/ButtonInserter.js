	
	function ButtonInserter ( chrome, $, event_hub, template, element, insert_reply_button ) {

		var private = {

			insert_compose_button: function () {
				setInterval( function () {

					$(".I5").each( function ( index, container ) {

						if ( $( "#peppermint_compose_button", container ).length === 0 ) {

							var id = Date.now() + '-' + Math.random() + '-' + Math.random() + '-' + Math.random();
							var button = $( "#peppermint_compose_button", element.shadowRoot ).clone();
							
							container.dataset.id = id;
							button[0].dataset.id = id;
							
							button.on( 'click', function () {
								event_hub.fire( "peppermint_compose_button_click", { id } );
							});

							$( ".a8X.gU>div", container ).append( button );

						}

					});

				}, 50 );
			},

			insert_dropdown_button: function () {
				setInterval( function () {
					$(".b7.J-M").each( function ( index, container ) {
						if ( $( "#v_dropdown_button", container ).length === 0 ) {

							var button = $( "#v_dropdown_button", element.shadowRoot ).clone();

							button.on( "click", function () {
								event_hub.fire( "peppermint_reply_button_click", { type: "dropdown_button" } );
							});

							$( container ).children('div:eq(2)').after( button );

						}
					});
				}, 50 );
			},

			insert_reply_button: function () {
				setInterval( function () {

					$(".gH.acX").each( function ( index, container ) {
						if ( $( "#v_reply_button", container ).length === 0 ) {

							var button = $( "#v_reply_button", element.shadowRoot ).clone();

							button.on( "click", function () {
								event_hub.fire( "peppermint_reply_button_click", { type: "button" } );
							});

							$( container ).prepend( button );

						}
					});
                    
                    $(".a3s").each( function ( index, element ) {
							$("a[href^='https://peppermint.com/reply']", element ).each( function ( index, element) {
								var link = $(element);
								
								if ( link.attr('id') !== 'peppermintReply' ) {
									
									link.attr('id','peppermintReply');
	
									link.on( "click", function () {
										event.preventDefault();
										event_hub.fire( "peppermint_reply_button_click", { type: "button" } );
									})

								};
							})
							
						});
					
				}, 50 );
			},

			replace_mock_player: function () {

				setInterval( function () {

					var pep_email = $( ".a3s table[alt='peppermint_email']" )[0];

					if ( pep_email && pep_email.querySelector( "span[alt='long_url']" ) ) {

                        var urls = {
                            long: pep_email.querySelector( "span[alt='long_url']" ).getAttribute( "title" ),
                            short: pep_email.querySelector( "span[alt='short_url']" ).getAttribute( "title" )
                        };
                        
						var audio_element = $( "<audio controls ></audio>" )[ 0 ];
						audio_element.src = urls.long;

						$( pep_email ).find( "td[alt='fake_audio_container']" ).append( audio_element );
						$( pep_email ).find( "table[alt='controls']" ).remove();
						$( pep_email ).attr( "alt", "" );

                        // if audio can't be reached, swap to an error message/icon
                        // $.ajax({
                        //     type: 'HEAD',
                        //     url: urls.cloudfront_ssl,
                        //     complete: function(xhr, textStatus) {
                                
                        //         if( xhr.status == 403 || xhr.status == 404 )
                        //         {
                        //             Raven.captureMessage("invalid audio URL");
                                    
                        //             $.get(chrome.extension.getURL('/html/templates/audio-player-error.html')
                        //                 , function(template_html) {
                                        
                        //                 $( mock_player ).next().html(
                        //                     template_html
                        //                     .replace( "{{EXTENSION_ROOT}}", chrome.extension.geteURL("/") )
                        //                 );
                                        
                        //             });
                        //         }
                        //     }
                        // });

					}

				}, 50 )

			}

		};

		var public = {

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$.extend( element, public );

			private.insert_compose_button();
			private.insert_dropdown_button();
			private.replace_mock_player();
			if ( insert_reply_button ) private.insert_reply_button();
            
		} () );

		return element;

	};
	