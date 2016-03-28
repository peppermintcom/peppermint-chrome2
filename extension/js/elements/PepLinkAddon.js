	
	function PepLinkAddon ( chrome, $, event_hub, template, element, link ) {
		
		var state = {

			wrap: null,
			transcription: ""

		};

		var private = {

			play_click_handler: function () {

				$( "#play_icon", state.wrap ).hide();
				$( "#pause_icon", state.wrap ).css( "display", "flex" );

				$( "#audio_element", state.wrap ).css({ height: "30px" });
				$( "#audio_element", state.wrap ).animate({ width: "300px" });
				$( "#audio_element", state.wrap )[ 0 ].play();

			},

			pause_click_handler: function () {

				$( "#play_icon", state.wrap ).css( "display", "flex" );
				$( "#pause_icon", state.wrap ).hide();

				$( "#audio_element", state.wrap ).animate({ width: "0px" }, 400 );
				$( "#audio_element", state.wrap )[ 0 ].pause();
				setTimeout( function () {

					$( "#audio_element", state.wrap ).css({ height: "0px" });
				
				}, 400 );

			},

			audio_ended_handler: function () {

				$( "#play_icon", state.wrap ).css( "display", "flex" );
				$( "#pause_icon", state.wrap ).hide();

				$( "#audio_element", state.wrap ).animate({ width: "0px" }, 400 );
				$( "#audio_element", state.wrap )[ 0 ].pause();
				setTimeout( function () {

					$( "#audio_element", state.wrap ).css({ height: "0px" });
				
				}, 400 );

			},

			icons_mouseenter_handler: function () {

				if ( state.transcription ) {

					$( "#transcription", state.wrap ).show().animate( { opacity: 1 }, 200 );

				}

			},

			icons_mouseleave_handler: function () {

				if ( state.transcription ) {

					$( "#transcription", state.wrap ).animate( { opacity: 0 }, 200, function () {
						$( "#transcription", state.wrap ).hide();
					});
					
				}

			},

			init_event_handlers: function () {

				$( "#audio_element", state.wrap ).on( "ended", private.audio_ended_handler );

				$( "#pause_icon", state.wrap ).on( "click", private.pause_click_handler );
				$( "#play_icon", state.wrap ).on( "click", private.play_click_handler );

				$( state.wrap ).on( "mouseenter", private.icons_mouseenter_handler );
				$( state.wrap ).on( "mouseleave", private.icons_mouseleave_handler );

				$( element ).on( "click", function ( event ) {

					event.preventDefault();
					event.stopPropagation();

				});

			},

			get_link_data: function () {

				chrome.runtime.sendMessage({ receiver: "GlobalController", name: "short_url_to_recording_data", short_url: link.href }, function ( response ) {

					if ( response ) {

						if ( response.data[0].attributes.is_complete ) {

							$( link ).prepend( element );

							$( "#audio_element", state.wrap )[ 0 ].src = response.data[0].attributes.canonical_url;
							$( "#transcription", state.wrap ).html( response.data[0].attributes.transcription );

							state.transcription = response.data[0].attributes.transcription;

						} else {

							console.log( "Audio is not yet ready" );
							setTimeout( private.get_link_data, 1000 );

						}

					} else {

						delete( element );

					}

				});

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
			element.classList.add( "pep_link_addon" );

			state.wrap = element.shadowRoot.querySelector( "#wrap" );

			private.init_event_handlers();
			private.get_link_data();

			$.extend( element, public );

		} () );

		return element;

	}
