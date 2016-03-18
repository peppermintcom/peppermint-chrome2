	
	function PepLinkAddon ( $, event_hub, template, element, long_url, transcription, link ) {
		
		var state = {

			wrap: null,
			removed: false

		};

		var private = {

			stick_to_link: function ( link ) {

				function tick () {

					var rect = link.getBoundingClientRect();
					var element_at_point = document.elementFromPoint( rect.left + 2, rect.top + 2 );

					// element.style.top = rect.top + "px";
					// element.style.left = rect.left + "px";

					element.style.transform = "translate( Xpx, Ypx )".replace( "X", rect.left ).replace( "Y", rect.top );

					if ( element_at_point === link || element_at_point === element ) {

						element.classList.remove( "peppermint_link_icon_overlayed" );
						link.classList.add( "peppermint_link" );

					} else {

						element.classList.add( "peppermint_link_icon_overlayed" );
						link.classList.remove( "peppermint_link" );

					}

					if ( !state.removed ) requestAnimationFrame( tick );

				}

				tick();

			},

			play_click_handler: function () {

				$( "#play_icon", state.wrap ).hide();
				$( "#pause_icon", state.wrap ).css( "display", "flex" );

				$( "#audio_element", state.wrap ).animate({ width: "300px" });
				$( "#audio_element", state.wrap )[ 0 ].play();

			},

			pause_click_handler: function () {

				$( "#play_icon", state.wrap ).css( "display", "flex" );
				$( "#pause_icon", state.wrap ).hide();

				$( "#audio_element", state.wrap ).animate({ width: "0px" });
				$( "#audio_element", state.wrap )[ 0 ].pause();

			},

			audio_ended_handler: function () {

				$( "#play_icon", state.wrap ).css( "display", "flex" );
				$( "#pause_icon", state.wrap ).hide();

				$( "#audio_element", state.wrap ).animate({ width: "0px" });
				$( "#audio_element", state.wrap )[ 0 ].pause();

			},

			icons_mouseenter_handler: function () {

				if ( transcription ) {

					$( "#transcription", state.wrap ).show().animate( { opacity: 1 }, 200 );

				}

			},

			icons_mouseleave_handler: function () {

				if ( transcription ) {

					$( "#transcription", state.wrap ).animate( { opacity: 0 }, 200, function () {
						$( "#transcription", state.wrap ).hide();
					});
					
				}

			}

		};

		var public = {

			remove: function () {

				state.removed = true;
				$( "#audio_element", state.wrap )[ 0 ].pause();
				$( "#play_icon", state.wrap ).off();
				$( "#pause_icon", state.wrap ).off();
				$( element ).remove();

			}

		};

		( function () {
			
			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			var wrap = state.wrap = element.shadowRoot.querySelector( "#wrap" );

			private.stick_to_link( link );

			$( "#audio_element", wrap )[ 0 ].src = long_url;
			$( "#audio_element", wrap ).on( "ended", private.audio_ended_handler );

			$( "#pause_icon", wrap ).on( "click", private.pause_click_handler );
			$( "#play_icon", wrap ).on( "click", private.play_click_handler );

			$( wrap ).on( "mouseenter", private.icons_mouseenter_handler );
			$( wrap ).on( "mouseleave", private.icons_mouseleave_handler );

			$( "#transcription", wrap ).html( transcription );

			$.extend( element, public );

		} () )

		return element;

	}
