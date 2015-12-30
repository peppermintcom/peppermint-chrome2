	
	function ButtonInserter ( $, insert_reply_button, template, element, img_url, event_hub ) {

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

			insert_dwopdown_button: function () {
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
			}

		};
                                
		var public = {

		};

		( function constructor () {

			template.innerHTML = template.innerHTML.replace( /{{IMG_URL}}/g, img_url );
			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$.extend( element, public );

			private.insert_compose_button();
			private.insert_dwopdown_button();
			if ( insert_reply_button ) private.insert_reply_button();

		} () );

		return element;

	};
	