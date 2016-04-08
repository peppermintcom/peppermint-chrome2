	
	function Popup ( $, event_hub, template, element ) {
		
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
				element.shadowRoot.getElementById( id ).addEventListener( "click", function () {
					event_hub.fire( "popup_" + id + "_click" );
				});
			}

		};

		var public = {
			
			set_page_status: function ( page_status ) {
				
				var options = {
					
					"uploading": function () {
						$( "#progress", element.shadowRoot ).html( "0%" );
						$( '#uploading_logo', element.shadowRoot ).show();
						$( '#uploaded_logo', element.shadowRoot ).hide();
						$( '#uploading_done_button', element.shadowRoot ).hide();
						$( '#uploading_page .popup_status', element.shadowRoot ).show();
						$( "#uploading_player_container", element.shadowRoot ).append( $( '#player_content', element.shadowRoot )[0] );
					},

					"uploaded": function () {
						$( '#uploading_logo', element.shadowRoot ).hide();
						$( '#uploaded_logo', element.shadowRoot ).show();
						$( '#uploading_done_button', element.shadowRoot ).show();
						$( '#uploading_page .popup_status', element.shadowRoot ).hide();
					},

					"finished": function () {
						$( "#finish_player_container", element.shadowRoot ).append( $( '#player_content', element.shadowRoot )[0] );
					}
					
				};

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'status_change', val: { 
						name : 'popup',
						status: page_status } 
					} 
				});
				
				if ( options[ page_status ] ) options[ page_status ]();
				
			},
			
			set_page: function ( page_name ) {
				
				$(".page", element.shadowRoot ).hide();
				$( "#" + page_name, element.shadowRoot ).show();
				if ( page_name === 'popup_finish' ) {
					$( element ).css({ width: '655px', height: 'auto' });
				} else {
					$( element ).css({ width: '380px', height: '336px' });
				}
				
			},

			set_url: function ( url ) {
				$( "#popup_finish_url", element.shadowRoot ).attr({ href: url }).html( url );
			},

			set_transcript: function ( transcript ) {

				if ( transcript ) {

					$( "#transcript", element.shadowRoot ).text( transcript );
					$( "#transcription_header", element.shadowRoot ).show();

				} else {
					
					$( "#transcript", element.shadowRoot ).text( "" );
					$( "#transcription_header", element.shadowRoot ).hide();

				}

			},

			set_error_message: function ( message ) {

				$( "#error_message", element.shadowRoot ).text( message );

			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );
			
			$.extend( element, public );

			[
				"delete_transcription_button",
				"uploading_re_record_button",
				"recording_cancel_button",
				"welcome_start_recording",
				"finish_start_new_button",
				"error_try_again_button",
				"uploading_done_button",
				"recording_done_button",
				"error_cancel_button",
				"cancel_uploading",
				"restart_upload"
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

		} () )
		
		return element;

	};
