
	( function ( $ ) {

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-button-incerter';
		
		proto.createdCallback = function () {

			var private = {

				element: null,

				constructor: function ( element ) {

					var template = document.getElementById( prefix + '-import' ).import.getElementById( prefix + '-template' );
					template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, element.dataset["url_prefix"] );

					element.createShadowRoot().appendChild(
						document.importNode( template.content, true )
					);

					private.element = element;

					private.incert_compose_button();
					private.incert_dwopdown_button();
					private.incert_reply_button();

				},
				incert_compose_button: function () {
					setInterval( function () {
						$(".a8X.gU>div").each( function ( index, element ) {
							if ( $( "#v_compose_button", element ).length === 0 ) {
								$( element ).append( $( "#v_compose_button", private.element.shadowRoot ).clone() );
							};
						});
					}, 50 )
				},
				incert_dwopdown_button: function () {
					setInterval( function () {
						$(".b7.J-M").each( function ( index, element ) {
							if ( $( "#v_dropdown_button", element ).length === 0 ) {
								$( element ).children('div:eq(2)').after( $( "#v_dropdown_button", private.element.shadowRoot ).clone() );
							};
						});
					}, 50 )
				},
				incert_reply_button: function () {
					setInterval( function () {
						$(".gH.acX").each( function ( index, element ) {
							if ( $( "#v_reply_button", element ).length === 0 ) {
								$( element ).prepend( $( "#v_reply_button", private.element.shadowRoot ).clone() );
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
	

