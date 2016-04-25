	
	function GlobalAnalytics ( chrome, $ ) {
		
		var state = {

			client: null,

			platform: 'chrome',
			
			keys: {
				
				cur_project_id: '',

				cur_write_key: ''

			},

			queue: [],

			processing_queue: false,

			log_results_to_console: false,

			allow_dev_analytics_upload: false,

			allow_prod_analytics_upload: true,
			
			allow_excluded_ips: false

		};

		var private = {

			keys: {

				dev_project_id: '56f2ac4fd2eaaa65ab2ca95c',

				dev_write_key: '96f74d11402399445d7952888881701758b770918e794cc291f178eadbc2983efeadf44ae452a5c91ddab2eeb8bd8665bd53a89b974d1d7e97a4fd20ca37524d004cc70d271d30d8cdc5e4f9dc9a6973be4d3294ef379cbb4f6bf99448fa3b8e',

				prod_project_id: '56f2ac0296773d6273dbdb98',

				prod_write_key: '8c5bd076e16f5688cf2c15789ca5bcb5002539daf884df90fa2deed78960447d6a5a31278c7b4baed95c141afbd38bed9b30783977d434f79018bbaab90a28b3883d4125f46e17078cece6c7c556a3df426b199326030e88f295ce38c2461590',
				
			},
			
			excluded_ips: ['202.161.69.186','89.75.41.165','103.29.249.98','109.92.14.3','91.202.129.193','10.128.53.216','94.60.59.87','194.44.123.178','195.160.235.251','178.137.164.217','174.51.132.175','91.218.105.218'],

			allow_analytics_upload: function(){

				return ( state.allow_excluded_ips || $.inArray(state.client_ip, private.excluded_ips) == -1 ) && (
					( state.keys.cur_project_id === private.keys.dev_project_id && state.allow_dev_analytics_upload ) ||
					( state.keys.cur_project_id === private.keys.prod_project_id && state.allow_prod_analytics_upload )
				);
					
			},
			
			global_properties: function ( eventCollection ) {
				
				var globalProps = {
					
					platform: state.platform,
					
					user: { ip_address: '${keen.ip}', user_agent: '${keen.user_agent}' }
					
				};
				
				return globalProps;
			},

			message_handler: function ( message, sender, callback ) {

				if ( message.receiver === 'GlobalAnalytics' ) {

					if ( message.name === 'track_analytic' ) {
						
						public.add_to_send_queue( message.analytic );

						return true;

					}

					else if ( message.name === 'config' ) {
						
						if ( message.option === 'log_to_console' )
							state.log_results_to_console = message.enabled;
						else if ( message.option === 'allow_dev_analytics_upload' )
							state.allow_dev_analytics_upload = message.enabled;
						else if ( message.option === 'allow_excluded_ips' )
							state.allow_excluded_ips = message.enabled;

						console.log('GlobalAnalytics.' + message.option + ':', message.enabled);

						return true;
					}	

				}

			},

			load: function () {
				
				if ( state.client === null ) {

					chrome.storage.local.get( [ "prod_id", "current_id" ], function ( items ) {

						if( items[ "prod_id" ] === items[ "current_id" ] ) {

							state.keys.cur_project_id = private.keys.prod_project_id;
							state.keys.cur_write_key = private.keys.prod_write_key;

						} else {

							state.keys.cur_project_id = private.keys.dev_project_id;
							state.keys.cur_write_key = private.keys.dev_write_key;

						}

						state.client = new Keen({
							projectId: state.keys.cur_project_id,
							writeKey: state.keys.cur_write_key
						});
						
						state.client.setGlobalProperties(private.global_properties);

						private.run();
																
						console.log("Keen loaded");

					});

					
				}
				
			},

			run: function () {

				setInterval(function(){

					if(!state.processing_queue && state.queue.length > 0) {

						state.processing_queue = true;

						var analytic = state.queue.pop();

						if (private.allow_analytics_upload()){

							private.send(analytic, function(response){

								state.processing_queue = false;
								
								if (state.log_results_to_console)
			                    	console.log(["Analytic Send Result > " + response._result, response]);		                    

							});

						} else {

							state.processing_queue = false;

							if (state.log_results_to_console)
			                    	console.log(["Analytic Discarded", analytic]);

						}

					};

				}, 250);

			},

			send: function ( analytic, callback ) {
				
				state.client.addEvent( analytic.name, analytic.val, function(err, res){
					
					var response = {};
					
					var info = analytic.name + ((analytic.val.name) ? '.' + analytic.val.name : '');
					
					if (err) {							
						
						Raven.log( 'GlobalAnalytics', 'send', 'Failed to send analytic event to Keen', err, false, {
							name: 'analytic_info', val: info
						} );
						
						response = { 
							_result: 'ERROR: ' + info, 
							analytic, 
							err 
						};							
						
					}
					else {  
						
						response = { 
							_result: 'success: ' + info, 
							analytic,
							res 
						};

                    }
                    
                    callback(response);                    
                        
                });
            }

		};

		var public = {
			
			add_to_send_queue: function ( analytic ) {
				
				state.queue.push( analytic );
				
			}

		};

		( function constructor () {

			chrome.runtime.onMessage.addListener( private.message_handler );
			
			$.get('https://api.ipify.org', function(data) {
				state.client_ip = data;			
			});
						
			private.load();
			
			// chrome.runtime.sendMessage( { receiver: 'GlobalAnalytics', name: 'config', option: 'log_to_console', enabled: true } );
			// chrome.runtime.sendMessage( { receiver: 'GlobalAnalytics', name: 'config', option: 'allow_dev_analytics_upload', enabled: true } );

		} () )

		return public;

	}
