
	( function () {
		
		var Player = function ( element ) {
			
			var private = {
				
				audio: new Audio(),
				
				set_control_icon( state ) {
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
					element.shadowRoot.querySelector("#control").style.display = '';
				},

				disable: function () {
					element.shadowRoot.querySelector("#control").style.display = 'none';
				}

			};

			private.audio.addEventListener( 'timeupdate', private.handle_audio_progress );
			element.shadowRoot.querySelector("#play").addEventListener( 'click', private.handle_play_click );
			element.shadowRoot.querySelector("#pause").addEventListener( 'click', private.handle_pause_click );
			element.shadowRoot.querySelector(".stripe_container").addEventListener( 'click', private.handle_stripe_click );
			private.audio.addEventListener( "ended", private.handle_audio_end );

			return public;
				
		};
	
		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-player';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( 'template' );
		var url_prefix = document.getElementById( prefix + '-import' ).href.split(/\//g).slice( 0, -1 ).join("/");

		proto.attachedCallback = function () {
			
			template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, url_prefix );
			
			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);

			var player = new Player( this );
			var element = this;

			Object.keys( player ).forEach( function ( key ) {
				element[ key ] = player[ key ];
			});

		}

		document.registerElement( prefix, { prototype: proto } );

	} () );
	