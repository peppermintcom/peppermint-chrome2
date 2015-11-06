
	( function () {

		var Recorder = function () {

			var private = {

				element: null,
				iframe: null

			};

			var public = {

				start: function () {
					return new Promise( function( resolve, reject ) {

						window.onmessage = function ( event ) {

							if ( event.data.name === 'started' ) {
								resolve();
							} else {
								reject();
							}

						};

						private.iframe.contentWindow.postMessage({
							name: 'start'
						},"*");

					});
				},
				cancel: function () {
					private.iframe.contentWindow.postMessage({
						name: 'cancel'
					},"*");
				},
				finish: function () {
					return new Promise( function( resolve, reject ) {

						window.onmessage = function ( event ) {

							resolve( event.data.blob );

						};

						private.iframe.contentWindow.postMessage({
							name: 'finish'
						},"*");

					});
				},
				blob_to_buffer: function ( blob ) {
					return new Promise( function ( resolve ) {
						var reader = new FileReader();
						reader.readAsArrayBuffer( blob );
						reader.onloadend = function () {
							resolve( reader.result );
						};
					});
				},
				blob_to_data_url: function ( blob ) {
					return new Promise ( function ( resolve ) {
						var reader = new FileReader();
						reader.onloadend = function () {
							resolve( reader.result );
						}
						reader.readAsDataURL( blob )
					});
				}

			};

			public.constructor = function ( element ) {

				private.element = element;
				private.iframe = element.shadowRoot.querySelector("#iframe");

			};

			return public;

		};
	
		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-recorder';
		var template = document.getElementById( prefix + '-import' ).import.getElementById( 'template' );
		
		proto.attachedCallback = function () {

			template.innerHTML = template.innerHTML.replace( /{{URL_PREFIX}}/g, this.getAttribute("url-prefix") );

			this.createShadowRoot().appendChild(
				document.importNode( template.content, true )
			);

			var element = this;
			var recorder = new Recorder();

			Object.keys( recorder ).forEach( function ( key ) {
				element[ key ] = recorder[ key ];
			});

			recorder.constructor( element );

		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	