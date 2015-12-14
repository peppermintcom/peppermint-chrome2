	
	function Popup ( $, template ) {
		
		//draggable plugin
			(function($){
			    $.fn.tinyDraggable = function(options){
			        var settings = $.extend({ handle: 0, exclude: 0 }, options);
			        return this.each(function(){
			            var dx, dy, el = $(this), handle = settings.handle ? settings.handle : el;
			            handle.on({
			                mousedown: function(e){
			                    if (settings.exclude && ~$.inArray(e.target, settings.exclude, el)) return;
			                    e.preventDefault();
			                    var os = el.offset(); dx = e.pageX-os.left, dy = e.pageY-os.top;
			                    $(document).on('mousemove.drag', function(e){ el.offset({top: e.pageY-dy, left: e.pageX-dx}); });
			                },
			                mouseup: function(e){ $(document).off('mousemove.drag'); }
			            });
			        });
			    }
			}($));
		//

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
						$( "#progress", private.element.shadowRoot ).html( "0%" );
						$( '#uploading_logo', private.element.shadowRoot ).show();
						$( '#uploaded_logo', private.element.shadowRoot ).hide();
						$( '#uploading_done_button', private.element.shadowRoot ).hide();
						$( '#uploading_page .popup_status', private.element.shadowRoot ).show();
						$( "#uploading_player_container", private.element.shadowRoot ).append( $( '#player_content', private.element.shadowRoot )[0] );
					},

					"uploaded": function () {
						$( '#uploading_logo', private.element.shadowRoot ).hide();
						$( '#uploaded_logo', private.element.shadowRoot ).show();
						$( '#uploading_done_button', private.element.shadowRoot ).show();
						$( '#uploading_page .popup_status', private.element.shadowRoot ).hide();
					},

					"finished": function () {
						$( "#finish_player_container", private.element.shadowRoot ).append( $( '#player_content', private.element.shadowRoot )[0] );
					}
					
				};
				
				if ( options[ page_status ] ) options[ page_status ]();
				
			},
			
			set_page: function ( page_name ) {
				
				$(".page", private.element.shadowRoot ).hide();
				$( "#" + page_name, private.element.shadowRoot ).show();
				if ( page_name === 'popup_finish' ) {
					$( private.element ).css({ width: '655px', height: 'auto' });
				} else {
					$( private.element ).css({ width: '380px', height: '336px' });
				}
				
			},

			set_url: function ( url ) {
				$( "#popup_finish_url", private.element.shadowRoot ).attr({ href: url }).html( url );
			},

			set_transcript: function ( transcript ) {
				$( "#transcript", private.element.shadowRoot ).text( transcript );
			}

		};

		( function constructor () {

			var proto = Object.create( HTMLElement.prototype );
			
			proto.attachedCallback = function () {
			
				var element = this;

				private.element = this;

				this.createShadowRoot().appendChild( document.importNode( template.content, true ) );
				
				$.extend( this, public );

				[
					"recording_cancel_button",
					"recording_done_button",
					"error_cancel_button",
					"error_try_again_button",
					"uploading_re_record_button",
					"popup_finish_start_new_button",
					"uploading_done_button",
					"popup_welcome_start_recording",
					"restart_upload",
					"cancel"
				].forEach( private.create_click_dispatcher );

				$( element ).tinyDraggable({
					handle: $( "#header", element.shadowRoot ),
					exclude: $( ".header_button", element.shadowRoot )
				});

				$( "#hide_button", element.shadowRoot ).click( function () {
					$( element ).css({ left: '0px', bottom: '-300px', top: 'initial' });
					$( "#hide_button", element.shadowRoot ).hide();
					$( "#show_button", element.shadowRoot ).show();
				});

				$( "#show_button", element.shadowRoot ).click( function () {
					$( element ).css({ left: 'calc( 50% - 190px )', top: '100px', bottom: 'initial' });
					$( "#hide_button", element.shadowRoot ).show();
					$( "#show_button", element.shadowRoot ).hide();
				});

				$( "#header", element.shadowRoot ).on( "mousedown", function ( event ) {
					if ( $( event.originalEvent.path[0] ).is( "#header" ) ) {
						$( "#hide_button", element.shadowRoot ).show();
						$( "#show_button", element.shadowRoot ).hide();
					}
				});

				$( document ).on( "upload_progress", function ( event ) {
					$( "#progress", element.shadowRoot ).html( event.originalEvent.detail.progress + "%" );
				});
			
			};

			document.registerElement( 'v-popup', { prototype: proto } );

		} () )
		
	};
