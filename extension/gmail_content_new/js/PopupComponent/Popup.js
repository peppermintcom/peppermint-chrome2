
	var Popup = function ( $, document, url_prefix ) {
		
		var private = {
			
			element: null,
			
			constructor: function () {

				var proto = Object.create( HTMLElement.prototype );
				var prefix = 'v-popup';
				var template = document.getElementById( prefix + '-import' ).import.getElementById( prefix + '-template' );
				
				proto.createdCallback = function () {

					template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, url_prefix );
					
					this.createShadowRoot().appendChild(
						document.importNode( template.content, true )
					);
			
				}

				document.registerElement( prefix, { prototype: proto } );
				
			}
			
			get_dispatcher: function ( event_name ) {
				return function () {
					element.dispatchEvent( new CustomEvent( event_name ) );
				}
			},

		};
		
		$( "#recording_cancel_button", element.shadowRoot ).click( private.get_dispatcher( 'recording_cancel' ) );
		$( "#recording_done_buttton", element.shadowRoot ).click( private.get_dispatcher( 'recording_done' ) );
		$( "#error_cancel_button", element.shadowRoot ).click( private.get_dispatcher( 'error_cancel' ) );
		$( "#error_done_button", element.shadowRoot ).click( private.get_dispatcher( 'error_done' ) );
		$( "#uploading_re_record_button", element.shadowRoot ).click( private.get_dispatcher( 'uploading_re_record' ) );
		$( "#uploading_done_button", element.shadowRoot ).click( private.get_dispatcher( 'uploading_done' ) );

		private.constructor();
		
		var public = {
			
			add: function () {
				
			},
			
			open: function () {
				
			},
			
			close: function () {
				
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
				
				if ( options[ page_status ] ) else {
					options[ page_status ]();
				}
				
			}			
			
		};
		
		return public;
		
	};
