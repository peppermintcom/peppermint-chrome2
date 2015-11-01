
	( function () {
		
		var Player = function ( element ) {
			
			var obj = {
				
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
					obj.audio.src = src;
				},
				play: function () {
					obj.audio.play();
				},
				pause: function () {
					obj.audio.pause();
				},
				
				handle_attr_changed: function () {
					obj.set_control_icon("play");
					obj.pause();
					obj.set_src( element.dataset["src"] );
					obj.audio.currentTime = 0;
					element.shadowRoot.querySelector(".stripe.stripe_green").style.width = '0%';
				},
				handle_audio_progress: function () {
					element.shadowRoot.querySelector(".stripe.stripe_green").style.width = ( 100 * obj.audio.currentTime / obj.audio.duration ) + '%';
				},
				handle_play_click: function () {
					obj.set_control_icon("pause");
					obj.play();
				},
				handle_pause_click: function () {
					obj.set_control_icon("play");
					obj.pause();
				},
				handle_stripe_click: function ( event ) {
					obj.audio.currentTime = ( ( event.offsetX ) / event.currentTarget.getBoundingClientRect().width ) * obj.audio.duration;
				},
				handle_audio_end: function () {
					obj.set_control_icon("play");
				}
				
			};
			
			obj.audio.addEventListener( 'timeupdate', obj.handle_audio_progress );
			element.shadowRoot.querySelector("#play").addEventListener( 'click', obj.handle_play_click );
			element.shadowRoot.querySelector("#pause").addEventListener( 'click', obj.handle_pause_click );
			element.shadowRoot.querySelector(".stripe_container").addEventListener( 'click', obj.handle_stripe_click );
			obj.audio.addEventListener( "ended", obj.handle_audio_end );
			
			( new MutationObserver( obj.handle_attr_changed ) ).observe( element, { attributes: true });
			obj.handle_attr_changed();
			
			return {
				
				
				
			};
			
		};
	
		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-player';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( prefix + '-template' );
		
		proto.createdCallback = function () {
			
			template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, this.dataset["url_prefix"] );
			
			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);
			this.player = new Player( this );
		}

		document.registerElement( prefix, { prototype: proto } );

	} () );
	