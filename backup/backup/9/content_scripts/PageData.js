
	V.PageData = function ( window ) {
	
		var ajax = {
			
			get: function ( url, success_callback, failure_callback ) {
				
				var request = new XMLHttpRequest();
				request.open('GET', url, true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
					// Success!
					success_callback( request.responseText );
				  } else {
					// We reached our target server, but it returned an error
					failure_callback();
				  }
				};

				request.onerror = function() {
				  // There was a connection error of some sort
				  failure_callback();
				};

				request.send();

			},
			
			post: function ( url, data, success_callback, failure_callback ) {
				
				var request = new XMLHttpRequest();
				request.open('POST', url, true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
					// Success!
					success_callback( request.responseText );
				  } else {
					// We reached our target server, but it returned an error
					failure_callback();
				  }
				};

				request.onerror = function() {
				  // There was a connection error of some sort
				  failure_callback();
				};
				
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				request.send( data );

			}
		
		};
		
		var obj = {
			
			contacts: null,
			
			get_contacts ( callback ) {
		
				function normalize_contacts ( contacts ) {
					for ( var i = 0; i < contacts.length; i++ ) {
						contacts[i] = [ contacts[i][1], contacts[i][2] ];
					}
					return contacts;
				};
				
				function get_emails_from_contacts ( contacts ) {
					for ( var i = 0; i < contacts.length; i++ ) {
						contacts[i] = contacts[i][2];
					}
					return contacts;
				};

				ajax.post(
					'/mail/u/0/?view=au&ik='+GLOBALS[9],
					'',
					function( response ){
						callback(
							get_emails_from_contacts(
								JSON.parse(
									response.replace( ")]}'", '' ).replace( /'/g, '"' )
								)[0][0][1]
							)
						)
					},
					function(){
						callback( false );
					}
				)
			}
			
		};

		return {
			
			_obj_: obj,
			
			get_contacts: function ( callback ) {
				if ( obj.contacts ) {
					callback( obj.contacts );
				} else {
					obj.get_contacts( function ( contacts ) {
						callback( contacts );
						obj.contacts = contacts;
					});
				}
			},
			
			get_page_data () {
				return {
					thread_id: window.location.href.match(/[^\/]+$/)[0],
					receiver: window.document.querySelector('.iw').firstElementChild.getAttribute('email')
				};
			}
			
		};
		
	};