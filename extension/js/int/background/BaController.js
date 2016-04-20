	
	function BaController ( chrome, $, hub ) {
		
		var state = {

			big_black: $( "<img src = '/img/browser_action_icons/big_black.png' >" )[ 0 ],
			big_transp: $( "<img src = '/img/browser_action_icons/big_transp.png' >" )[ 0 ],
			period: 1000,
			recording: false

		};

		var private = {

			get_image_data: function ( big_black, big_transp, percentage ) {

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

				return ctx.getImageData( 0, 0, 38, 38 );

			},

			tick: function () {

				if ( state.recording ) {

					var image_data = private.get_image_data(
						state.big_black,
						state.big_transp,
						( 1 + Math.cos( Math.PI * Date.now() / state.period ) ) / 2
					);

					chrome.browserAction.setIcon({ imageData: image_data });
				
					setTimeout( private.tick, 20 );
				
				} else {

					chrome.browserAction.setIcon({ path: "/img/browser_action_icons/standart.png" });

				}

			}

		};

		var message_handlers = {

			recording_started: function ( message ) {

				state.recording = true;
				private.tick();

			},

			recording_canceled: function ( message ) {

				state.recording = false;
				chrome.browserAction.setIcon({ path: "/img/browser_action_icons/standart.png" });

			},

			recording_finished: function ( message ) {

				state.recording = false;
				chrome.browserAction.setIcon({ path: "/img/browser_action_icons/standart.png" });

			}

		};
		
		hub.add({

			background_message: function ( message ) {

				if ( message.receiver === "Content" && message.recording_data && ( message.recording_data.source.name === "popup" || message.recording_data.source.name === "popup_feedback" ) ) {

					if ( message_handlers[ message.name ] ) {

						message_handlers[ message.name ]( message );

					}

				}

			}

		});

	}
