	
	function PepLinkAddon ( $, template, element, long_url, transcription, link ) {
		
		var state = {

			stick_to_link_interval: null,
			wrap: null

		};

		var private = {

			stick_to_link: function ( link ) {

				state.stick_to_link_interval = setInterval( function () {

					var rect = link.getBoundingClientRect();
					var element_at_point = document.elementFromPoint( rect.left + 2, rect.top + 2 );

					element.style.top = rect.top + "px";
					element.style.left = rect.left + "px";

					if ( element_at_point === link || element_at_point === element ) {

						element.classList.remove( "peppermint_link_icon_overlayed" );

					} else {

						element.classList.add( "peppermint_link_icon_overlayed" );

					}

				}, 50 );

			},

			play_click_handler: function () {

				$( "#play_icon", state.wrap ).hide();
				$( "#pause_icon", state.wrap ).show();

				$( "#audio_element", state.wrap ).animate({ width: "300px" });
				$( "#audio_element", state.wrap )[ 0 ].play();

			},

			pause_click_handler: function () {

				$( "#play_icon", state.wrap ).show();
				$( "#pause_icon", state.wrap ).hide();

				$( "#audio_element", state.wrap ).animate({ width: "0px" });
				$( "#audio_element", state.wrap )[ 0 ].pause();

			}

		};

		var public = {

		};

		( function () {
			
			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			var wrap = element.shadowRoot.querySelector( "#wrap" );
			state.wrap = wrap;

			private.stick_to_link( link );

			$( "#audio_element", wrap )[ 0 ].src = long_url;

			$( "#pause_icon", wrap ).on( "click", private.pause_click_handler );
			$( "#play_icon", wrap ).on( "click", private.play_click_handler );

			$( "#pause_icon", wrap ).attr( "title", transcription );
			$( "#play_icon", wrap ).attr( "title", transcription );

			$.extend( element, public );

		} () )

		return element;

	}
