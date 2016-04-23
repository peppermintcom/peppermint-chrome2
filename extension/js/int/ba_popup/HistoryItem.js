
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

			set_state: function ( state_text ) {

				if ( state_text === "uploading" ) {

					$( "#status", state.wrap ).text( "Uploading..." );

				} else if ( state_text === "uploaded" ) {

					$( "#status", state.wrap ).text( private.format_time( recording_data.timestamp || Date.now() ) );

				}

			}

		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			state.wrap = element.shadowRoot.querySelector( "#wrap" );
			element.dataset.id = recording_data.id;

			public.set_state( recording_data.state );;
			
			/* set up the player */

				$( "#player_container", state.wrap ).append( player );
				player.enable();
				
				if ( recording_data.data_url ) {

					player.set_url( recording_data.data_url );
				
				} else {

					player.set_url( recording_data.urls.canonical_url );

				}

			/**/

			/* set up deletion */

				$( "#delete", state.wrap ).on( "click", function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "delete_recording_data", recording_data });
					$( element ).remove();

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { name: 'delete_recording_data', type: 'click', element: 'HistoryItem', id: '#delete' } } 
					});

				});

			/**/

			/* set up the transcription */

				setTimeout( function () {


					if ( recording_data.transcription_data && recording_data.transcription_data.text ) {

						$( "#transcription_container", state.wrap )[0].dataset.text = recording_data.transcription_data.text;

						hub.fire( "ex_text_element_created", { element: $( "#transcription_container", state.wrap )[0] } );

					} else {

						$( "#transcription_container", state.wrap ).hide()

					}

				}, 100 );

			/**/

			/* set up the clipboard copying */

				$( "#copy_to_clipboard", state.wrap ).on( "click", function () {

					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: recording_data.urls.short_url });
					alert( "Link Copied to Clipboard!" );

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { name: 'copy_to_clipboard', type: 'click', element: 'HistoryItem', id: '#copy_to_clipboard' } } 
					});

				});

			/**/

			/* extend the element */
				$.extend( element, public );
			/**/

		} () )

		return element;

	}
