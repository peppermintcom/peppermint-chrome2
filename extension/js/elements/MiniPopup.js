	
	function MiniPopup ( $, template, element, img_url, event_hub, utilities ) {
		
		var private = {
			
			element: null,

			get_dispatcher: function ( event_name ) {
				return function () {
					event_hub.fire( "mini_popup_" + id + "_click" );
				};
			},
            
            add_metric: function ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'MiniPopup' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            }

		};

		var public = {

			reset: function () {
				$( "#progress", element.shadowRoot ).html("");
			},

			set_state: function ( state ) {

				var options = {

					"uploading": function () {
						$( ".phrase_container", element.shadowRoot ).css({ display: "none" });
						$( "#uploading_phrase_container", element.shadowRoot ).css({ display: "" });
					},

					"uploading_failed": function () {
						$( ".phrase_container", element.shadowRoot ).css({ display: "none" });
						$( "#uploading_failed_phrase_container", element.shadowRoot ).css({ display: "" });
					}

				};

				options[ state ]();

			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( document ).on( "upload_progress", function ( event ) {
				$( "#progress", element.shadowRoot ).html( event.originalEvent.detail.progress + "%" );
			});

			$( "#cancel", element.shadowRoot ).click( private.get_dispatcher( 'cancel_click' ) );
			$( "#try_again", element.shadowRoot ).click( private.get_dispatcher( 'try_again_click' ) );

			$.extend( element, public );
            
            private.add_metric({ name: 'class-load', val: { class: 'MiniPopup' } });

		} () )

		return element;
		
	};
