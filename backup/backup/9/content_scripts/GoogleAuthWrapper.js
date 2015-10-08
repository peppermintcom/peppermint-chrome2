
	V.GoogleAuthWrapper = function ( gapi ) {
		
		var obj = {
	
			CLIENT_ID: '10346040300-81s5iin2daqci67lrht3i1hqradsedvq.apps.googleusercontent.com',
			SCOPE: 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify',
			
			authorized: false,
			
			check_auth_result: function ( result ) {
				if ( result && !result.error ) {
					return true;
				} else {
					return false;
				}
			},
			
			silent_auth: function ( callback ) {
				gapi.auth.authorize(
					{
						client_id: obj.CLIENT_ID,
						scope: obj.SCOPE,
						immediate: true
					},
					function ( result ) {
						callback( 
							obj.check_auth_result( result )
						);
					}
				);
			}
			
		};
		
		obj.silent_auth( function ( result ) {
			obj.authorized = result;
		});
		
		return {
			
			_obj_: obj,
			
			is_authorized: function () {
				return obj.authorized;
			},
			auth: function ( callback ) {
				gapi.auth.authorize(
					{
						client_id: obj.CLIENT_ID,
						scope: obj.SCOPE,
						immediate: false
					},
					function ( result ) {
						callback(
							obj.authorized = obj.check_auth_result( result )
						);
					}
				);
			}
			
		}
		
	};

	