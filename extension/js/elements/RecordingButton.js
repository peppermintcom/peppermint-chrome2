	
	function RecordingButton ( chrome, $, hub, template, element ) {
		
		var state = {

			big_black: null,
			big_transp: null,
			period: 1000,
			active: false,
			wrap: null

		};

		var private = {

			get_data_url: function ( big_black, big_transp, percentage ) {

				var canvas = document.createElement( "canvas" );
				canvas.width = 38;
				canvas.height = 38;
				var ctx = canvas.getContext( "2d" );
				
				ctx.fillStyle = "hsl( 176, 100%, 38% )";
				ctx.fillRect( 0, 0, 38, 38 );
				
				ctx.fillStyle = "rgba( 121, 121, 121, A )".replace( "A", percentage );
				ctx.fillRect( 0, 0, 38, 38 );
				
				ctx.globalCompositeOperation = "destination-out";

				ctx.drawImage( big_black, 0, 0 );

				ctx.globalCompositeOperation = "source-over";
				
				ctx.drawImage( big_transp, 0, 0 );

				return canvas.toDataURL();

			}

		};

		var public = {

			start: function () {

				state.active = true;

			},

			stop: function () {

				state.active = false;
				$( "#image", state.wrap ).attr( "src", chrome.extension.getURL( "/img/browser_action_icons/standart.png" ) );

			},

			toggle: function () {

				if ( state.active ) {

					state.active = false;
					$( "#image", state.wrap ).attr( "src", chrome.extension.getURL( "/img/browser_action_icons/standart.png" ) );

				} else {

					state.active = true;

				}

			}

		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$( element ).on( "click", function () { hub.fire( "recording_button_click" ) } );

			state.wrap = element.shadowRoot.querySelector( "#wrap" );
			state.big_black = $( "#big_black", state.wrap )[ 0 ];
			state.big_transp = $( "#big_transp", state.wrap )[ 0 ];

			( function tick () {
				
				if ( state.active ) {

					var data_url = private.get_data_url(
						state.big_black,
						state.big_transp,
						( 1 + Math.cos( Math.PI * Date.now() / state.period ) ) / 2
					);

					$( "#image", state.wrap ).attr( "src", data_url );
				
				}
				
				setTimeout( tick, 20 );

			} () );

			$.extend( element, public );

		} () );

		return element;

	}
