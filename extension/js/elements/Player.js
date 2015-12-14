
	var Player = function ( $, template ) {
		
		var private = {
			
			audio: new Audio(),
			
			set_control_icon: function ( state ) {
				if ( state === 'play' ) {
					private.element.shadowRoot.querySelector("#play").style.display = 'block';
					private.element.shadowRoot.querySelector("#pause").style.display = 'none';
				} else if ( state === 'pause' ) {
					private.element.shadowRoot.querySelector("#play").style.display = 'none';
					private.element.shadowRoot.querySelector("#pause").style.display = 'block';
				}
			},

			set_src: function ( src ) {
				private.audio.src = src;
			},
			play: function () {
				private.audio.play();
			},


			handle_audio_progress: function () {
				private.element.shadowRoot.querySelector(".stripe.stripe_green").style.width = ( 100 * private.audio.currentTime / private.audio.duration ) + '%';
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
				private.element.shadowRoot.querySelector(".stripe.stripe_green").style.width = '0%';
			},

			pause: function () {
				private.audio.pause();
				private.set_control_icon("play");
			},

			enable: function () {
				private.element.shadowRoot.querySelector("#control").style.display = '';
			},

			disable: function () {
				private.element.shadowRoot.querySelector("#control").style.display = 'none';
			}

		};

		( function constructor () {

			var proto = Object.create( HTMLElement.prototype );

			proto.attachedCallback = function () {
				
				this.createShadowRoot().appendChild( document.importNode( template.content, true ) );

				$.extend( this, public );

				private.element = this;

				private.audio.addEventListener( 'timeupdate', private.handle_audio_progress );
				private.element.shadowRoot.querySelector("#play").addEventListener( 'click', private.handle_play_click );
				private.element.shadowRoot.querySelector("#pause").addEventListener( 'click', private.handle_pause_click );
				private.element.shadowRoot.querySelector(".stripe_container").addEventListener( 'click', private.handle_stripe_click );
				private.audio.addEventListener( "ended", private.handle_audio_end );

			};

			document.registerElement( "v-player", { prototype: proto } );

		} () )
			
	};
