
	( function () {

		var mock = {
			
			gapi: {
				
				auth: {
					
					authorize: function ( data, callback ) {
						
						callback( true );
						
					}
					
				}
				
			}
			
		}

		describe( "GoogleAuthWrapper", function () {
			
			var wrapper;
			
			beforeEach( function () {
				
				wrapper = new V.GoogleAuthWrapper( mock.gapi );
				
			});
			
			describe( "general", function () {
				
				it( "check auth on start", function () {
					
					spyOn( mock.gapi.auth, 'authorize' )
					new V.GoogleAuthWrapper( mock.gapi );
					expect( mock.gapi.auth.authorize ).toHaveBeenCalled();
					
				});
				
			});
			
			describe( "check_auth_result", function () {
				
				it( "returns false for falsy arguments and for objects, with with falsy error property", function () {
					
					expect( wrapper._obj_.check_auth_result( false ) ).toBe( false );
					expect( wrapper._obj_.check_auth_result( null ) ).toBe( false );
					expect( wrapper._obj_.check_auth_result( '' ) ).toBe( false );
					expect( wrapper._obj_.check_auth_result( NaN ) ).toBe( false );
					expect( wrapper._obj_.check_auth_result( undefined ) ).toBe( false );
					expect( wrapper._obj_.check_auth_result( 0 ) ).toBe( false );
					
				});
				
			});
			
		});
		
	} () );