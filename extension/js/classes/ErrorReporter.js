	
	function ErrorReporter ( chrome, $, source ) {
		
		var state = {

			platform: 'chrome',

			cur_key: ''

		};

		var private = {

			keys: {

				prod_raven_key: "https://a4270cba18b548faa1edb82032392705@app.getsentry.com/70977",

				dev_raven_key: "https://53153404d9bf49e1893fe34d56a180d1@app.getsentry.com/69131"
				
			},

			set_key: function () {

				return new Promise ( function ( resolve, reject ) {

					chrome.storage.local.get( [ "prod_id", "current_id" ], function ( items ) {

						state.cur_key = (items[ "prod_id" ] === items[ "current_id" ]) ? private.keys.prod_raven_key : private.keys.dev_raven_key;

						resolve( state.cur_key );

					});
					
				});

			},

			load: function () {

				private.set_key()
				.then( function ( key ) {

					Raven.config(key).install();

					Raven.log = private.log;						

					// Raven.log( 'ErrorReporter', 'load_error_logger', 'Raven loaded' );

				});

			},

			log: function ( source_class, source_method, message, error, log_to_console ) {
				

				var attr = { logger: 'chrome.error_reporter', tags: {
					'source': source,
					'class': source_class, 
					'method': source_method,
					'message': message,
					'error_name': ( ( error && error.name ) ? error.name : '')
				}};

				if( error ) {

					Raven.captureException( error, attr );

				} else {

					Raven.captureMessage( message, attr );

				}

				if ( log_to_console ) {

					console.error('Logged to Raven - ' + attr.tags.message, attr, error);
					
				}
					
			
			}

		};

		var public = {

		};

		( function constructor () {

			private.load();

		} () )

		return public;

	}
