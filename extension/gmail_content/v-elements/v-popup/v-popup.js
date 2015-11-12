
	( function () {
		
		var Popup = function () {
			
			var private = {
				
				element: null,

				create_click_dispatcher: function ( id ) {
					private.element.shadowRoot.getElementById( id ).addEventListener( "click", function () {
						private.element.dispatchEvent( new CustomEvent( id + "_click", { bubbles: true } ) );
					});
				}

			};

			var public = {

				set_page_status: function ( page_status ) {
					
					var options = {
						
						"uploading": function () {
							$( '#uploading_logo', private.element.shadowRoot ).show();
							$( '#uploaded_logo', private.element.shadowRoot ).hide();
							$( '#uploading_done_button', private.element.shadowRoot ).hide();
							$( '#uploading_page .popup_status', private.element.shadowRoot ).show();
							$( "#uploading_player_container", private.element.shadowRoot ).append( $( '#player_content', private.element.shadowRoot )[0] )
						},
						"uploaded": function () {
							$( '#uploading_logo', private.element.shadowRoot ).hide();
							$( '#uploaded_logo', private.element.shadowRoot ).show();
							$( '#uploading_done_button', private.element.shadowRoot ).show();
							$( '#uploading_page .popup_status', private.element.shadowRoot ).hide();
						},
						"finished": function () {
							$( "#finish_player_container", private.element.shadowRoot ).append( $( '#player_content', private.element.shadowRoot )[0] )
						}
						
					};
					
					if ( options[ page_status ] ) options[ page_status ]();
					
				},
				
				set_page: function ( page_name ) {
					
					$(".page", private.element.shadowRoot ).hide();
					$( "#" + page_name, private.element.shadowRoot ).show();
					
				},

				set_url: function ( url ) {

					$( "#popup_finish_url", private.element.shadowRoot ).attr({ href: url }).html( url );

				}

			};

			public.constructor = function ( element ) {

				private.element = element;

				[
					"recording_cancel_button",
					"recording_done_button",
					"error_cancel_button",
					"error_try_again_button",
					"uploading_re_record_button",
					"popup_finish_start_new_button",
					"uploading_done_button",
					"popup_welcome_start_recording"
				].forEach( private.create_click_dispatcher );

			};

			return public;
			
		};
	

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-popup';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( 'template' );
		var url_prefix = document.getElementById( prefix + '-import' ).href.split(/\//g).slice( 0, -1 ).join("/");

		proto.attachedCallback = function () {

			template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, url_prefix );
			
			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);
			
			var element = this;
			var popup = new Popup( this );
			
			Object.keys( popup ).forEach( function ( key ) {
				element[ key ] = popup[ key ];
			});

			popup.constructor( element );

		}

		document.registerElement( prefix, { prototype: proto } );

	} () );
	