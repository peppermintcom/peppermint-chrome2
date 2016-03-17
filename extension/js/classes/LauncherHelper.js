	
	function LauncherHelper ( $ ) {
		
		var state = {

		};

		var private = {

		};

		var public = {

			urls_to_templates: function ( extension_root, urls ) {
			
				return new Promise ( function ( resolve ) {

					$.get( urls.pop(), function ( html ) {

						var template = document.createElement( "template" );
						template.innerHTML = html.replace( /{{EXTENSION_ROOT}}/g, extension_root );

						if ( urls.length === 0 ) {
							
							resolve([ template ]);

						} else {

							urls_to_templates( urls )
							.then( function ( templates ) {

								templates.push( template );
								resolve( templates );

							})

						}

					});

				});
			
			}

		};

		return public;

	}
