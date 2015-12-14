	
	function MiniPopup ( $, template ) {
		
		var private = {
			
			element: null,

			get_dispatcher: function ( event_name ) {
				return function () {
					private.element.dispatchEvent( new CustomEvent( event_name, { bubbles: true } ) );
				};
			}

		};

		var public = {

			reset: function () {
				$( "#progress", private.element.shadowRoot ).html("");
			},

			set_state: function ( state ) {

				var options = {

					"uploading": function () {
						$( ".phrase_container", private.element.shadowRoot ).css({ display: "none" });
						$( "#uploading_phrase_container", private.element.shadowRoot ).css({ display: "" });
					},

					"uploading_failed": function () {
						$( ".phrase_container", private.element.shadowRoot ).css({ display: "none" });
						$( "#uploading_failed_phrase_container", private.element.shadowRoot ).css({ display: "" });
					}

				};

				options[ state ]();

			}

		};

		( function constructor () {

			var proto = Object.create( HTMLElement.prototype );
			
			proto.attachedCallback = function () {

				this.createShadowRoot().appendChild( document.importNode( template.content, true ) );

				$( document ).on( "upload_progress", function ( event ) {
					$( "#progress", this.shadowRoot ).html( event.originalEvent.detail.progress + "%" );
				});

				$( "#cancel", this.shadowRoot ).click( private.get_dispatcher( 'cancel_click' ) );
				$( "#try_again", this.shadowRoot ).click( private.get_dispatcher( 'try_again_click' ) );

				private.element = this;

				$.extend( this, public );
				
			};

			document.registerElement( "v-mini-popup", { prototype: proto } );

		} () )
		
	};
