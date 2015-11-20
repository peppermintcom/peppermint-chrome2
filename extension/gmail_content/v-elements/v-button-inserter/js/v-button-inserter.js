
	( function ( $ ) {

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-button-inserter';
		
		proto.attachedCallback = function () {

			var private = {

				element: null,

				constructor: function ( element ) {

					var template = document.getElementById( prefix + '-import' ).import.getElementById( prefix + '-template' );
					var url_prefix = document.getElementById( prefix + '-import' ).href.split(/\//g).slice( 0, -1 ).join("/");
					template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, url_prefix );

					element.createShadowRoot().appendChild(
						document.importNode( template.content, true )
					);

					private.element = element;

					private.insert_compose_button();
					private.insert_dwopdown_button();

					if (
						window.localStorage.peppermint_storage_items
						&& JSON.parse( window.localStorage.peppermint_storage_items ).options_data
						&& ! JSON.parse( window.localStorage.peppermint_storage_items ).options_data.reply_button_disabled
					) {
						private.insert_reply_button();
					}


				},
				insert_compose_button: function () {

					setInterval( function () {

						$(".I5").each( function ( index, container ) {

							if ( $( "#v_compose_button", container ).length === 0 ) {

								var id = Date.now() + '-' + Math.random() + '-' + Math.random() + '-' + Math.random();
								var button = $( "#v_compose_button", private.element.shadowRoot ).clone();
								
								container.dataset["id"] = id;
								button[0].dataset["id"] = id;
								
								button.on( 'click', function () {
									button[0].dispatchEvent(
										new CustomEvent( 'compose_button_click', { bubbles: true } )
									);
								});

								$( ".a8X.gU>div", container ).append( button );

							};

						});

					}, 50 )

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

							};
						});
					}, 50 )
				},
				insert_reply_button: function () {
					setInterval( function () {
						$(".gH.acX").each( function ( index, element ) {
							if ( $( "#v_reply_button", element ).length === 0 ) {

								var button = $( "#v_reply_button", private.element.shadowRoot ).clone();

								button.on( "click", function () {
									button[0].dispatchEvent( new CustomEvent( 'reply_button_click', { bubbles: true } ) );
								})

								$( element ).prepend( button );

							};
						});
					}, 50 )
				}


			};

			var public = {



			};

			private.constructor( this );
			
		};

		document.registerElement( prefix, { prototype: proto } );

	} ( jQuery ) );
	

