
	( function () {

		var proto = Object.create( HTMLElement.prototype );
		var prefix = 'v-uploader';
		
		proto.createdCallback = function () {

			this.uploader = new VUploader( $pmjQuery );
			
		};

		document.registerElement( prefix, { prototype: proto } );

	} () );
	

