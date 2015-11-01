
	( function () {
		
		var Popup = function ( element ) {
			
			var obj = {
				
				get_dispatcher: function ( event_name ) {
					return function () {
						element.dispatchEvent( new CustomEvent( event_name ) );
					}
				},
				
				set_page: function ( page_name ) {
					
					$(".page", element.shadowRoot ).hide();
					$( "#" + page_name, element.shadowRoot ).show();
					
				},
				set_page_status: function ( page_status ) {
					
					var options = {
						
						"uploading": function () {
							$( '#uploading_logo', element.shadowRoot ).show();
							$( '#uploaded_logo', element.shadowRoot ).hide();
							$( '#uploading_done_button', element.shadowRoot ).hide();
							$( '#uploading_page .popup_status', element.shadowRoot ).show();
						},
						"uploaded": function () {
							$( '#uploading_logo', element.shadowRoot ).hide();
							$( '#uploaded_logo', element.shadowRoot ).show();
							$( '#uploading_done_button', element.shadowRoot ).show();
							$( '#uploading_page .popup_status', element.shadowRoot ).hide();
						}
						
					};
					
					if ( options[ page_status ] ) options[ page_status ]();
					
				},
				
				handle_attr_change: function () {
					obj.set_page( element.dataset["page"] );
					obj.set_page_status( element.dataset["page_status"] );
				}

			};
			
			$( "#recording_cancel_button", element.shadowRoot ).click( obj.get_dispatcher( 'recording_cancel' ) );
			$( "#recording_done_buttton", element.shadowRoot ).click( obj.get_dispatcher( 'recording_done' ) );
			$( "#error_cancel_button", element.shadowRoot ).click( obj.get_dispatcher( 'error_cancel' ) );
			$( "#error_done_button", element.shadowRoot ).click( obj.get_dispatcher( 'error_done' ) );
			$( "#uploading_re_record_button", element.shadowRoot ).click( obj.get_dispatcher( 'uploading_re_record' ) );
			$( "#uploading_done_button", element.shadowRoot ).click( obj.get_dispatcher( 'uploading_done' ) );
			
			( new MutationObserver( obj.handle_attr_change ) ).observe( element, { attributes: true });
			obj.handle_attr_change();
			
			return {
				
				player: $( '#player', element.shadowRoot )[0]
				
			};
			
		};
	

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-popup';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( prefix + '-template' );
		
		proto.createdCallback = function () {

			template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, this.dataset["url_prefix"] );
			
			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);
			
			this.popup = new Popup( this );
			
		}

		document.registerElement( prefix, { prototype: proto } );

	} () );
	