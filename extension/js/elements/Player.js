
	var Player = function ( $, template, element ) {
		
		var private = {
			
			audio: new Audio(),

			set_control_icon: function ( state ) {
				if ( state === 'play' ) {
					element.shadowRoot.querySelector("#play").style.display = 'block';
					element.shadowRoot.querySelector("#pause").style.display = 'none';
				} else if ( state === 'pause' ) {
					element.shadowRoot.querySelector("#play").style.display = 'none';
					element.shadowRoot.querySelector("#pause").style.display = 'block';
				}
			},

			set_src: function ( src ) {
				private.audio.src = src;
			},
			play: function () {
				private.audio.play();
			},


			handle_audio_progress: function () {
				element.shadowRoot.querySelector(".stripe.stripe_green").style.width = ( 100 * private.audio.currentTime / private.audio.duration ) + '%';
			},
			handle_play_click: function () {
				private.set_control_icon("pause");
				private.play();
			},
			handle_pause_click: function () {
				private.set_control_icon("play");
				public.pause();
			},
			handle_stripe_click: function ( event ) {
				private.audio.currentTime = ( ( event.offsetX ) / event.currentTarget.getBoundingClientRect().width ) * private.audio.duration;
			},
			handle_audio_end: function () {
				private.set_control_icon("play");
			}
			
		};
		
		var public = {

			set_url: function ( url ) {

				private.set_src( url );
				public.reset();

			},
			
			reset: function () {
				private.set_control_icon("play");
				private.audio.pause();
				private.audio.currentTime = 0;
				element.shadowRoot.querySelector(".stripe.stripe_green").style.width = '0%';
			},

			pause: function () {
				private.audio.pause();
				private.set_control_icon("play");
			},

			enable: function () {
				$( element.shadowRoot.querySelectorAll("#control, .stripe_container") ).show();
			},

			disable: function () {
				$( element.shadowRoot.querySelectorAll("#control, .stripe_container") ).hide();
			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$.extend( element, public );

			$( private.audio ).on( 'timeupdate', private.handle_audio_progress );
			$( private.audio ).on( "ended", private.handle_audio_end );

			$( "#play", element.shadowRoot ).on( 'click', private.handle_play_click );
			$( "#pause", element.shadowRoot ).on( 'click', private.handle_pause_click );
			$( ".stripe_container", element.shadowRoot ).on( 'click', private.handle_stripe_click );

		} () )

		return element;
			
	};
