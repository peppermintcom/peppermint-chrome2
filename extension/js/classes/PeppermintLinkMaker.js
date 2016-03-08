	
	function PeppermintLinkMaker ( $, chrome ) {
		
		var private = {

			detach_events: function ( element ) {

				$( element ).on( "hover", function ( event ) {

					event.stopPropagation();
					event.preventDefault();

				});

				$( element ).on( "mousemove", function ( event ) {

					event.stopPropagation();
					event.preventDefault();

				});

				$( element ).on( "click", function ( event ) {

					event.stopPropagation();
					event.preventDefault();

				});

			},

			attach_icon_to_link: function ( icon, link ) {

				var interval = setInterval( function () {

					var rect = link.getBoundingClientRect();

					icon.style.top = rect.top + "px";
					icon.style.left = rect.left + "px";

					if ( document.elementFromPoint( rect.left + 12, rect.top ) === link ) {

						icon.classList.remove( "peppermint_link_icon_overlayed" );

					} else {

						icon.classList.add( "peppermint_link_icon_overlayed" );

					}

					if ( !$.contains( document, link ) ) {

						clearInterval( interval );
						$( icon ).remove();

					}

				}, 10 );

			},

			make_play_icon: function ( link ) {

				var play_icon = document.createElement( "img" );
				play_icon.src = chrome.extension.getURL( "/img/play-button.png" );
				play_icon.classList.add( "peppermint_link_icon" );
				private.detach_events( play_icon );

				$( play_icon ).on( "click", function () {

					play_icon.audio_element.play();
					$( play_icon ).hide();
					$( play_icon.pause_icon ).show();

				});

				private.attach_icon_to_link( play_icon, link );

				return play_icon;

			},

			make_pause_icon: function ( link ) {

				var pause_icon = document.createElement( "img" );
				pause_icon.src = chrome.extension.getURL( "/img/pause-button.png" );
				pause_icon.classList.add( "peppermint_link_icon" );
				private.detach_events( pause_icon );

				$( pause_icon ).on( "click", function () {

					pause_icon.audio_element.pause();
					$( pause_icon ).hide();
					$( pause_icon.play_icon ).show();

				});

				private.attach_icon_to_link( pause_icon, link );

				$( pause_icon ).hide();

				return pause_icon;

			},

			make_text_icon: function ( element, transcription ) {

				var text_icon = document.createElement( "img" );
				text_icon.src = chrome.extension.getURL( "/img/text-line-form.png" );
				text_icon.classList.add( "peppermint_link_icon" );
				text_icon.title = transcription;
				private.detach_events( text_icon );

				return text_icon;

			},

			make_audio_element: function ( long_url ) {

				var audio_element = document.createElement( "audio" );
				audio_element.src = long_url;
				audio_element.controls = false;
				audio_element.loop = true;

				return audio_element;

			}

		};

		var public = {

			upgrade_link: function ( element, long_url, transcription ) {

				var play_icon = private.make_play_icon( element );
				var pause_icon = private.make_pause_icon( element );
				var text_icon = private.make_text_icon( element, transcription );
				var audio_element = private.make_audio_element( long_url );

				pause_icon.play_icon = play_icon;
				play_icon.pause_icon = pause_icon;
				play_icon.audio_element = audio_element;
				pause_icon.audio_element = audio_element;

				// $( document.body ).append( text_icon );
				$( document.body ).append( play_icon );
				$( document.body ).append( pause_icon );

			}

		};

		return public;

	}
