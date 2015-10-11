
	V.OptionsData = function ( hub ) {
		
		var obj = {
			
		};
		
		hub.add({
			
			"disable_reply_button_change": function ( data ) {
				obj["reply_button_disabled"] = data.checked;
				hub.fire({ name: "options_data_change", options_data: obj });
			}
			
		});
		
	}

	V.PageManager = function ( $, hub ) {
		
		$("#disable_reply_button").change( function ( event ) {
			hub.fire({ name: "disable_reply_button_change", checked: event.target.checked });
		});
		
		return {
			
			set_options_data: function ( data ) {
				
				if ( data["reply_button_disabled"] !== undefined ) $("#disable_reply_button").prop( "checked", data["reply_button_disabled"] );
				
			}
			
		};
		
	};
	
	V.StorageManager = function ( chrome ) {
		
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
		
		obj.hub = new V.EventHub('options_hub',{});
		obj.page_manager = new V.PageManager( jQuery, obj.hub );
		obj.storage_manager = new V.StorageManager( chrome );
		obj.options_data = new V.OptionsData( obj.hub );
		
		obj.hub.add({
			
			"ready": function () {
				obj.storage_manager.get( function ( items ) {
					if ( items["options_data"] !== undefined ) {
						obj.page_manager.set_options_data(
							items["options_data"]
						);
					};
				});
			},
			
			"options_data_change": function ( data ) {
				obj.storage_manager.set({
					"options_data": data.options_data
				});
			}
			
		});
		
		obj.hub.fire({ name: "ready" });
		
	} ( jQuery, chrome ) );
	
	
	
	
	
	
	
	