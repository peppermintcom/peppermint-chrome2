
	( function () {
		
		var LetterManager = function ( element ) {
			
			var private = {
				


			};

			var public = {

	

			};

			public.constructor = function ( element ) {


			};

			return public;
			
		};
	

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-letter-manager';

		proto.attachedCallback = function () {

			var element = this;
			var letter_manager = new LetterManager();
			
			Object.keys( letter_manager ).forEach( function ( key ) {
				element[ key ] = letter_manager[ key ];
			});

			letter_manager.constructor( element );

		}

		document.registerElement( prefix, { prototype: proto } );

	} () );
