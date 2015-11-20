
	OptionsData = function () {
		
		var obj = {
			
		};
		
		$( document ).on( "disable_reply_button_change", function ( event ) {

			var data = event.originalEvent.detail
			obj["reply_button_disabled"] = data.checked;

			document.dispatchEvent( new CustomEvent( "options_data_change", {
				detail: {
					options_data: obj
				}
			}));

		});

	};

	PageManager = function () {
		
		$("#disable_reply_button").change( function ( event ) {

			document.dispatchEvent( new CustomEvent( "disable_reply_button_change", {
				detail: {
					checked: event.target.checked		
				}
			}));

		});
		
		return {
			
			set_options_data: function ( data ) {
				
				if ( data["reply_button_disabled"] !== undefined ) $("#disable_reply_button").prop( "checked", data["reply_button_disabled"] );
				
			}
			
		};
		
	};
	
	StorageManager = function ( chrome ) {
		
		return {
			
			"set": function ( obj_to_save ) {
				
				chrome.storage.local.set( obj_to_save );
				
			},
			
			"get": function ( callback ) {
				chrome.storage.local.get( null, callback );
			}
			
		}
		
	};

	( function ( jQuery, chrome ) {
		
		var obj = {
			
			
		};
		
		obj.page_manager = new PageManager();
		obj.storage_manager = new StorageManager( chrome );
		obj.options_data = new OptionsData();
		
		$( document ).ready( function () {
			obj.storage_manager.get( function ( items ) {
				if ( items["options_data"] !== undefined ) {
					obj.page_manager.set_options_data(
						items["options_data"]
					);
				};
			});
		});

		$( document ).on( "options_data_change", function ( event ) {

			var data = event.originalEvent.detail;

			obj.storage_manager.set({
				"options_data": data.options_data
			});

		});

	} ( jQuery, chrome ) );
	
	
	
	
	
	
	
	