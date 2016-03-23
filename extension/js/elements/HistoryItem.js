
	function HistoryItem ( chrome, $, hub, template, element, player, recording_data ) {

		var state = {

			wrap: null

		};

		var private = {

			pad: function ( n ) { return n < 10 ? "0" + n : n },

			format_time: function ( ts ) {

				var date = new Date( ts );

				return "MO/D/Y, H:MN TM"
				.replace( "MO", private.pad( date.getMonth() + 1 ) )
				.replace( "D", private.pad( date.getDate() ) )
				.replace( "Y", date.getYear() - 100 )
				.replace( "H", date.getHours() > 12 ? date.getHours() - 12 : date.getHours() )
				.replace( "MN", private.pad( date.getMinutes() ) )
				.replace( "TM", date.getHours() > 12 ? "PM" : "AM" )

			}

		};

		var public = {



		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			state.wrap = element.shadowRoot.querySelector( "#wrap" );

			$( "#time", state.wrap ).text( private.format_time( recording_data.timestamp || Date.now() ) );
			
			/* set up the player */

				$( "#player_container", state.wrap ).append( player );
				player.enable()
				player.set_url( recording_data.urls.canonical_url );

			/**/

			/* set up deletion */

				$( "#delete", state.wrap ).on( "click", function () {

					chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "delete_recording_data", recording_data });
					$( element ).remove();

				});

			/**/

			/* set up the transcription */

				$( "#transcription", state.wrap ).text( recording_data.transcription_data.text );

				setTimeout( function () {

					$( "#show_less", state.wrap ).hide();

					$( "#show_less", state.wrap ).on( "click", function () {

						$( "#show_more", state.wrap ).show();
						$( "#show_less", state.wrap ).hide();
						$( "#transcription_container", state.wrap ).css({ "max-height": "40px" });

					});

					$( "#show_more", state.wrap ).on( "click", function () {

						$( "#show_more", state.wrap ).hide();
						$( "#show_less", state.wrap ).show();
						$( "#transcription_container", state.wrap ).css({ "max-height": "none" });

					});

					if ( !recording_data.transcription_data.text ) {

						$( "#transcription_container", state.wrap ).hide()

					} else if ( $( "#transcription", state.wrap ).height() > 40 ) {

						$( "#transcription_container", state.wrap ).show()
						$( "#show_more", state.wrap ).show();

					} else {

						$( "#transcription_container", state.wrap ).show()
						$( "#show_more", state.wrap ).hide();

					}

				}, 1 );

			/**/

			/* set up the clipboard copying */

				$( "#copy_to_clipboard", state.wrap ).on( "click", function () {

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: recording_data.urls.short_url })

				});

			/**/

			/* extend the element */
				$.extend( element, public );
			/**/

		} () )

		return element;

	}
