	
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
								event_hub.fire( "peppermint_reply_button_click" );
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
								event_hub.fire( "peppermint_reply_button_click" );
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
										event_hub.fire( "peppermint_reply_button_click" );
									})

								};
							})
							
						});
					
				}, 50 );
			},

			replace_mock_player: function () {

				setInterval( function () {

					var mock_player = $( ".a3s table[bgcolor='#6fd5b9']:not(.hidden)" )[0];

					if ( mock_player && mock_player.parentElement.querySelector( "span[alt='long_url']" ) ) {

						mock_player.classList.add( "hidden" );
					
						mock_player.style.display = "none";
                        
                        var urls = {
                            long: mock_player.parentElement.querySelector( "span[alt='long_url']" ).getAttribute( "title" ),
                            short: mock_player.parentElement.querySelector( "span[alt='short_url']" ).getAttribute( "title" )
                        };
                        
                        urls.long_no_protocol = urls.long.replace('http:','');
                        
                        if ( urls.long.indexOf( 'cloudfront.net' ) > 0 )
                            urls.cloudfront_ssl = urls.long;
                        else
                            urls.cloudfront_ssl = urls.long.replace('http://go.peppermint.com/','https://duw3fm6pm35xc.cloudfront.net/');
                        
                        $.get(chrome.extension.getURL('/html/templates/audio-player.html'), function(template_html) {
                            
                            $( mock_player ).after(
                                template_html
                                .replace( "{{LONG_URL}}", urls.cloudfront_ssl )
                                .replace( "{{SHORT_URL}}", urls.short )
                            );
                            
                        });
                        
                        // if audio can't be reached, swap to an error message/icon
                        $.ajax({
                            type: 'HEAD',
                            url: urls.cloudfront_ssl,
                            complete: function(xhr, textStatus) {
                                
                                if( xhr.status == 403 || xhr.status == 404 )
                                {
                                    Raven.captureMessage("invalid audio URL");
                                    
                                    $.get(chrome.extension.getURL('/html/templates/audio-player-error.html')
                                        , function(template_html) {
                                        
                                        $( mock_player ).next().html(
                                            template_html
                                            .replace( "{{EXTENSION_ROOT}}", chrome.extension.geteURL("/") )
                                        );
                                        
                                    });
                                }
                            }
                        });

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
	