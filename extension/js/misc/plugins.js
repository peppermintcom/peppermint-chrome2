	
	( function ( $ ) {

		$.copy_to_clipboard = function( text ) {

			var doc = document;
			var temp = doc.createElement("textarea");
			var initScrollTop = doc.body.scrollTop;

			doc.body.insertBefore(temp, doc.body.firstChild);
			temp.value = text;
			temp.focus();
			doc.execCommand("SelectAll");
			doc.execCommand("Copy", false, null);
			temp.blur();
			doc.body.scrollTop = initScrollTop;
			doc.body.removeChild(temp);

		};

	} ( jQuery ) )
	