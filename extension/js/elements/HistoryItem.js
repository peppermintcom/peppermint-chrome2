
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
				.replace( "Y", date.getYear() )
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

			$( "#player_container", state.wrap ).append( player );
			$( "#time", state.wrap ).text( private.format_time( recording_data.timestamp || Date.now() ) );
			$( "#transcription", state.wrap ).text( recording_data.transcription_data.text );

			$.extend( element, public );

		} () )

		return element;

	}
