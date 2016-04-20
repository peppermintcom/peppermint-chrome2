	
	function LauncherHelper ( $ ) {
		
		var state = {

		};

		var private = {

		};

		var public = {

			urls_to_templates: function ( extension_root, urls ) {
			
				return new Promise ( function ( resolve, reject ) {

					var url = urls.pop();

					$.get( extension_root + url[ 1 ], function ( html ) {

						var template = document.createElement( "template" );
						template.innerHTML = html.replace( /{{EXTENSION_ROOT}}/g, extension_root );

						if ( urls.length === 0 ) {
							
							var templates = {};
							templates[ url[ 0 ] ] = template;
							resolve( templates );

						} else {

							public.urls_to_templates( extension_root, urls )
							.then( function ( templates ) {

								templates[ url[ 0 ] ] = template;
								resolve( templates );

							})
							.catch( function ( error ) {

								Raven.log( 'launcherhelper', 'urls_to_templates', '', error );
								
								reject();

							});

						}

					});

				});
			
			}

		};

		return public;

	}
