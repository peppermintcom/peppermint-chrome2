
	( function () {

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-uploader';
		
		proto.createdCallback = function () {

			this.uploader = new V.Uploader( jQuery );
			
		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	

