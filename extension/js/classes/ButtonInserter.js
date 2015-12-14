
	
	function ButtonInserter ( $, insert_reply_button ) {

		var private = {

			insert_compose_button: function () {

					setInterval( function () {

						$(".I5").each( function ( index, container ) {

							if ( $( "#v_compose_button", container ).length === 0 ) {

								var id = Date.now() + '-' + Math.random() + '-' + Math.random() + '-' + Math.random();
								var button = $( "#v_compose_button", private.element.shadowRoot ).clone();
								
								container.dataset.id = id;
								button[0].dataset.id = id;
								
								button.on( 'click', function () {
									button[0].dispatchEvent(
										new CustomEvent( 'compose_button_click', { bubbles: true } )
									);
								});

								$( ".a8X.gU>div", container ).append( button );

							}

						});

					}, 50 );
			},

			insert_dwopdown_button: function () {
					setInterval( function () {
						$(".b7.J-M").each( function ( index, element ) {
							if ( $( "#v_dropdown_button", element ).length === 0 ) {

								var button = $( "#v_dropdown_button", private.element.shadowRoot ).clone();

								button.on( "click", function () {
									button[0].dispatchEvent( new CustomEvent( 'reply_button_click', { bubbles: true } ) );
								});

								$( element ).children('div:eq(2)').after( button );

							}
						});
					}, 50 );
			},

			insert_reply_button: function () {
					setInterval( function () {
						$(".gH.acX").each( function ( index, element ) {
							if ( $( "#v_reply_button", element ).length === 0 ) {

								var button = $( "#v_reply_button", private.element.shadowRoot ).clone();

								button.on( "click", function () {
									button[0].dispatchEvent( new CustomEvent( 'reply_button_click', { bubbles: true } ) );
								});

								$( element ).prepend( button );

							}
						});
						
						$(".a3s").each( function ( index, element ) {
							$("a[href^='https://peppermint.com/reply']", element ).each( function ( index, element) {
								var link = $(element);
								
								if ( link.attr('id') !== 'peppermintReply' ) {
									
									link.attr('id','peppermintReply');
	
									link.on( "click", function () {
										event.preventDefault();
										
										link[0].dispatchEvent( new CustomEvent( 'reply_button_click', { bubbles: true } ) );
									});

								}
							});
							
						});
						
					}, 50 );
			}

		};

		var public = {

		};

		( function constructor () {

			private.insert_compose_button();
			private.insert_dwopdown_button();
			if ( insert_reply_button ) private.insert_reply_button();

		} () );

		return public;

	};
	