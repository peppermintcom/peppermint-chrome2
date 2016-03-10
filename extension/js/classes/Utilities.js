
	function Utilities ( chrome, $, source ) {

		var private = {
			
            loglevel: null,
            
            last_alert: null,
            
            analytics_client: null,
            
            get_options_data: function ( ){
                chrome.storage.local.get("options_data", function(data){
                    
                    public.options_data = data.options_data;
                    
                });    
            },
            
            get_log_level: function ( ) {
                setInterval(function(){
                    chrome.storage.local.get("log_level", function(data){
                        if (!private.loglevel || private.loglevel !== data.log_level)
                            console.log('log level set to `' + data.log_level + '`');
                            
                        private.loglevel = data.log_level;    
                    })
                }, 500);
            },
            
            send_page_alert_controller: function(  ) {
                
                chrome.runtime.onMessage.addListener( function ( req, sender, callback ) {
                
                    if ( req.name === "page_alert" ) {
                        
                        if (private.last_alert !== null){
                            
                            callback( private.last_alert );
                            private.last_alert = null;
                                
                        }

                    }                
                    
                });	
                
            },
            
            load_error_logger: function( ) {
                
                setTimeout(function(){
                    
                    Raven.config('https://53153404d9bf49e1893fe34d56a180d1@app.getsentry.com/69131')
                    .install();  
                    
                    console.log('Raven loaded from ' + source);
                    Raven.captureMessage('Raven loaded from ' + source);
                    
                }, 50);
                
            },
            
            load_analytics_tool: function ( ) {
                
                if ( private.analytics_client === null ){
                    
                    private.analytics_client = new Keen({
                        projectId: "56e0ac0d46f9a711cd6c91de",
                        writeKey: "cc6c23ec2471b22c29a9760a4dea1611d44b5b07fad2a64b5b892c6883d6ce9d415bc2fcd2742d2f9d5a3d72ba3c7b72fdda0632788ed7bd8aeacac3999ad69dc19e175c1a1375b02d136b429379d5dc1b808fb04f985ffb22244073d801ba99"
                    });
                    
                    private.analytics_client.addEvent("analytics-load", { source: source });
                    
                    console.log("Keen loaded from " + source);
                    
                }
                
            },
            
            send_analytics_metric: function ( metric, callback ) {
                
                if ( private.analytics_client === null ) {
                    
                    private.load_analytics_tool();
                    
                    setTimeout(function(){
                        private.send_analytics_metric( metric, callback );
                    }, 500);
                    
                } else {
                                        
                    private.analytics_client.addEvent( metric.name, metric.val, function(err, res){
                        
                        var response = {};
                        
                        if (err) {                            
                            
                            // todo: log to Raven
                            
                            response = { 
                                result: 'Keen ERROR', 
                                metric_name: metric.name, 
                                metric_val: metric.val, 
                                err 
                            };                            
                            
                        }
                        else {  
                            
                            response = { 
                                result: 'Keen result', 
                                metric_name: metric.name, 
                                metric_val: metric.val, 
                                res 
                            };

                        }
                        
                        console.log(response);
                            
                        if(callback) callback(response);
                            
                    });
                    
                }                

            }            
            
        };
                
        var public = {

            options_data: {},
            
            copy_to_clipboard: function ( text ) {
				    
			    var doc = document,
			        temp = doc.createElement("textarea"),
			        initScrollTop = doc.body.scrollTop;
			    doc.body.insertBefore(temp, doc.body.firstChild);
			    temp.value = text;
			    temp.focus();
			    doc.execCommand("SelectAll");
			    doc.execCommand("Copy", false, null);
			    temp.blur();
			    doc.body.scrollTop = initScrollTop;
			    doc.body.removeChild(temp);
		
			},
            
            log: function( data ) {
                
                if( private.loglevel == 'verbose' )
                    console.log(data);
                    
            },
            
            set_page_alert: function( data ) {
                
                private.last_alert = data;
                
                public.log({'page_alert_set': data});
                
            },
            
            valid_messaging_state: function(){
                
                try {
                    chrome.runtime.sendMessage("peppermint-messaging-test");
                } catch (error) {
                    // fail silently, messaging is temporarily unavailable
                    // generally, this only happens when manually refreshing the local extension
                    return false;
                }
                
                return true;

            },
            
            // metric: { name: 'name_of_metric', val: {/* object with data to pass */} }
            add_metric: function ( metric, callback ) {
                
                if( source === 'background' )
                
                    private.send_analytics_metric ( metric, callback );
                    
                else {
                    
                    if(!public.valid_messaging_state()){
                        setTimeout(function() {
                            add_metric( metric, callback );
                        }, 500);
                    }
                    else{
                        chrome.runtime.sendMessage({ name: 'add_metric', val: metric }, function(result) {
                            if ( callback ) callback( result );
                        })    
                    }
                    
                }
                
            }
                        
        };

		( function constructor () {
            
            private.load_error_logger();
                        
            private.get_log_level();
            
            private.get_options_data();
            
            private.send_page_alert_controller();
            
            
            public.add_metric({ name: 'class-load', val: { class: 'Utilities.js', source: source } });

		} () );
        
        return public;

	};

