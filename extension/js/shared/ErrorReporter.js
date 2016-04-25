	
	function ErrorReporter ( chrome, $, source ) {
		
		var state = {

			platform: 'chrome',

			cur_key: '',
			
			id: '',
			
			version: '',
			
			log_error_info_to_console: false

		};

		var private = {

			keys: {

				prod_raven_key: "https://a4270cba18b548faa1edb82032392705@app.getsentry.com/70977",

				dev_raven_key: "https://53153404d9bf49e1893fe34d56a180d1@app.getsentry.com/69131"
				
			},
			
			options: {
				release: chrome.runtime.getManifest().version,
				
				ignoreErrors: ['No transcription to upload','already_recording'
				],
				
				ignoreUrls: [
				],
				
				includePaths: [
				],
				
				shouldSendCallback: function(data) {
					
					if (state.log_error_info_to_console)
						console.log('raven data-shouldSendCallback', data);
					
					try {
						if(data.exception.values[0].orig_ex.stack.indexOf('sendMessageImpl') > 0)
							return false;
					} catch (error) { }
					
					return true;
				},
				
				dataCallback: function(data) {
					
					if (state.log_error_info_to_console)
						console.log('raven data-dataCallback', data);
						
					try {
						var fs = data.exception.values[0].orig_ex.stack;
						if (fs && fs.length > 0)
							data.extra.full_stack = fs;
					} catch (error) { }
					
					return data;
				}
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
				
				state.id = chrome.runtime.id;
				
				state.version = chrome.runtime.getManifest().version;

				private.set_key()
				.then( function ( key ) {
					
					Raven.config( key, private.options ).install();

					Raven.log = private.log;
					
					// Raven.setExtraContext({
					// 	arbitrary: {key: value},
					// 	foo: "bar"
					// });

					// Raven.log( 'ErrorReporter', 'load_error_logger', 'Raven loaded' );

				});

			},
			
			should_exclude: function(attr){
				
				var options_source = (this.options) ? this.options : Raven._globalOptions;
				
				return (attr.tags.message.match(options_source.ignoreErrors)) ||
					   (attr.tags.error_name.match(options_source.ignoreErrors)) ||
					   (attr.tags.error_message.match(options_source.ignoreErrors));	
			},

			log: function ( source_class, source_method, message, error, log_to_console, extra_data ) {
				
				log_to_console = state.log_error_info_to_console || log_to_console;
				
				var attr = { 
					logger: 'chrome.error_reporter', 
					tags: {
					'chrome_id': state.id,
					'chrome_version': state.version,
					'source': source,
					'class': source_class, 
					'method': source_method,
					'message': message,
					'error_name': ( ( error && error.name ) ? error.name : ''),
					'error_code': ( ( error && error.code ) ? error.code : ''),
					'error_message': ( ( error && error.message ) ? error.message : '')
					},
					extra: {						
						full_stack: ( error && error.stack ) ? error.stack : ''
					}
				};
				
				if ( extra_data ){
					attr.extra[extra_data.name] = extra_data.val;
				}
				
				if ( private.should_exclude(attr) ){						 
					if( log_to_console ){
						console.log("Error rejected due to ignore rule", attr);
						log_to_console=false;		
					}						
				}
				else if( error ) {

					Raven.captureException( error, attr );

				} else {

					Raven.captureMessage( message, attr );

				}

				if ( log_to_console ) {

					console.error('Logged to Raven - ' + attr.tags.message, attr, error);
					
				}					
			
			},
			
			message_handler: function ( message, sender, callback ) {

				if ( message.receiver === 'ErrorReporter' ) {

					if ( message.name === 'config' ) {
						
						if ( message.option === 'log_error_info_to_console' )
							state.log_error_info_to_console = message.enabled;

						console.log('ErrorReporter.' + message.option + ':', message.enabled);

						return true;
					}	

				}

			}

		};

		var public = {

		};
		
		( function constructor () {
			
			chrome.runtime.onMessage.addListener( private.message_handler );
			
			private.load();
			
			// chrome.runtime.sendMessage( { receiver: 'ErrorReporter', name: 'config', option: 'log_error_info_to_console', enabled: true } );

		} () )

		return public;

	}
