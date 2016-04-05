	
	function RecordingButton ( chrome, $, hub, template, element, options ) {
		
		var state = {

			big_black: null,
			big_transp: null,
			period: 250,
			active: false,
			wrap: null,
			color: "hsl( 176, 100%, 38% )",
			grey_color: "rgba( 121, 121, 121, A )",
			static_color: "rgba( 121, 121, 121, 1 )"

		};

		var private = {

			get_data_url: function ( big_black, big_transp, percentage, color, grey_color ) {

				var canvas = document.createElement( "canvas" );
				canvas.width = 38;
				canvas.height = 38;
				var ctx = canvas.getContext( "2d" );
				
				ctx.fillStyle = color;
				ctx.fillRect( 0, 0, 38, 38 );
				
				ctx.fillStyle = grey_color.replace( "A", percentage );
				ctx.fillRect( 0, 0, 38, 38 );
				
				ctx.globalCompositeOperation = "destination-out";

				ctx.drawImage( big_black, 0, 0 );

				ctx.globalCompositeOperation = "source-over";
				
				ctx.drawImage( big_transp, 0, 0 );

				return canvas.toDataURL();

			},

			set_static_icon: function () {

				$( "#image", state.wrap ).attr( "src",
					private.get_data_url(
						state.big_black,
						state.big_transp,
						1,
						state.color,
						state.static_color
					)
				);

			},

			show_stop_icon: function () {

				$( "#stop_icon", state.wrap ).css({ display: "block" }).css({ opacity: 1, left: "-22px" });

			},

			hide_stop_icon: function () {

				$( "#stop_icon", state.wrap ).css({ opacity: 0, left: "0px" });

			}

		};

		var public = {

			start: function () {

				if ( options.stop_icon ) private.show_stop_icon();
				state.active = true;

			},

			stop: function () {

				state.active = false;
				if ( options.stop_icon ) private.hide_stop_icon();
				private.set_static_icon()

			},

			set_static_color: function ( color ) {

				state.static_color = color;
				public.stop();

			}

		};

		( function () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			element.classList.add( "pep_recording_button" );

			$( element ).on( "click", function () { 
			
				hub.fire( "recording_button_click" );

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { type: 'click', name : 'recording_button_click' } } 
				});

			});

			state.wrap = element.shadowRoot.querySelector( "#wrap" );
			state.big_black = $( "#big_black", state.wrap )[ 0 ];
			state.big_transp = $( "#big_transp", state.wrap )[ 0 ];

			( function tick () {
				
				if ( state.active ) {

					var data_url = private.get_data_url(
						state.big_black,
						state.big_transp,
						( 1 + Math.cos( Math.PI * Date.now() / state.period ) ) / 2,
						state.color,
						state.grey_color
					);

					$( "#image", state.wrap ).attr( "src", data_url );
				
				} else {

					private.set_static_icon();

				}
				
				setTimeout( tick, 20 );

			} () );

			$.extend( element, public );

		} () );

		return element;

	}
