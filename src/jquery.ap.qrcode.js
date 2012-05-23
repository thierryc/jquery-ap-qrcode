/* apQrcode */
(function($) {

    var _qr;
    /**
	 * qrcode
	 * options : 
	 *      render:             string "image", "gif", "canvas", "table"; default: false 
	 *      typeNumber:         int 1 to 10; default: '4'
	 *      errorCorrectLevel:  string 'L','M','Q','H'
	 *      size:               in px; default: 256
	 *      margin:             in px; default 4* the cellSize,
	 * @param options object 
	 * @param 
	 */
    var methods = {
        
        _init: function(options) {
            var settings = $.extend({
                render		    : false,
			    size		    : false,
			    typeNumber	    : false,
			    correctLevel	: 'H'
            }, options);
            
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('apQrcode');
                var error = false;
                
                if (!data) {
                    settings = $.extend(settings, options);
                } else {
                    settings = $.extend(data.settings, options);
                }
                settings.text = settings.text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
                
                if(!settings.typeNumber) {
                    settings.typeNumber = 1;
                    var typeNumberIsSet = false;
                    while( !typeNumberIsSet ){
                        try {     
                            _qr = qrcode(settings.typeNumber, settings.correctLevel);
                            _qr.addData(settings.text);
                            _qr.make();
                        }
                        catch(err)
                        {
                            error = err;
                            settings.typeNumber++;
                            if(settings.typeNumber > 10) {
                                break;
                            }
                            continue;
                        }
                        var typeNumberIsSet = true;
                    }
                } else {
                    try {       
                        _qr = qrcode(settings.typeNumber, settings.correctLevel);
                        _qr.addData(settings.text);
                        _qr.make();
                    }
                    catch(err)
                    {
                        error = err;
                    }
                }
                
                if(!settings.size) {
                    settings.size = (_qr.getModuleCount() + 8)*4;
                }
                
                if(settings.margin) {
                    settings.cellSize = Math.round((settings.size - (settings.margin*2)) / _qr.getModuleCount());
                    settings.margin = settings.margin;
                } else {
                    settings.cellSize = Math.round( settings.size / (_qr.getModuleCount() + 8) );
                    settings.margin = Math.round(( settings.size - settings.cellSize * _qr.getModuleCount()) / 2);
                }
                
                $this.data('apQrcode', {
                    target: $this,
                    settings: settings,
                    error: error
                });
            });
        },
        image: function(options) {
            return $(this).apQrcode('gif', options);
        },
        gif: function(options) {
            return this.each(function() {
                options.render = 'gif';
                $(this).apQrcode('_init', options);
                var data = $(this).data('apQrcode');
                jQuery(_qr.createImgTag(data.settings.cellSize, data.settings.margin)).appendTo(this);
            });
        
        },
        canvas: function(options) {
            if(!(document.createElement('canvas').getContext)){
                return;
            }
            return this.each(function() {
                options.render = 'canvas';
                $(this).apQrcode('_init', options);
                var data = $(this).data('apQrcode');
                // create canvas element
                
                
                
                var canvas	= document.createElement('canvas');
                canvas.width	= data.settings.size;
                canvas.height	= data.settings.size;
                var ctx		= canvas.getContext('2d');
                var cellSize = data.settings.cellSize;
                
                var margin = data.settings.margin;
                for( var row = 0; row < _qr.getModuleCount(); row++ ){
                    for( var col = 0; col < _qr.getModuleCount(); col++ ){
                        ctx.fillStyle = _qr.isDark(row, col) ? "#000000" : "#ffffff";
                        ctx.fillRect( margin + col*cellSize, margin + row*cellSize, cellSize, cellSize );  
                    }
                }
                
                jQuery(canvas).appendTo(this);
            });
        },
        div: function(options) {
            return this.each(function() {
                options.render = 'div';
                $(this).apQrcode('_init', options);
                var data = $(this).data('apQrcode');
                // create canvas element
                var div	= $('<div/>')
                    .css('width', data.settings.size)
                    .css ('height', data.settings.size)
                    .css('position', 'relative');
                    
                var cellSize = data.settings.cellSize;
                var margin = data.settings.margin;
                // draw in the div
                for( var row = 0; row < _qr.getModuleCount(); row++ ){
                    for( var col = 0; col < _qr.getModuleCount(); col++ ){
                        var cell = $('<div/>')
                            .css('background-color', _qr.isDark(row, col) ? "#000000" : "#ffffff")
                            .css('position', 'absolute')
                            .css('top', margin + row*cellSize + 'px')
                            .css('left', margin + col*cellSize + 'px')
                            .css('width', cellSize)
                            .css ('height', cellSize);
                        $(cell).appendTo(div);  
                    }
                }
                $(div).appendTo(this);
            });
        },
        table: function(options) {
            return this.each(function() {
                options.render = 'table';
                $(this).apQrcode('_init', options);
                var data = $(this).data('apQrcode');
                $(_qr.createTableTag(data.settings.cellSize, data.settings.margin)).appendTo(this);          
            }); 
        }
        
    };
    
    jQuery.fn.apQrcode = function(method) {
        if (methods[method]) {
            if (typeof arguments[1] === 'string') {
                return methods[method].apply(this, [{text: arguments[1]}]);
            } else {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        } else if (typeof method === 'object' || !method) {
            return methods.image.apply(this, arguments);
        } else if (typeof arguments[0] === 'string' && !arguments[1]) {
            return methods.image.apply(this, [{text: arguments[0]}]);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.apQrcode');
        }
    };
    
    jQuery.fn.qrcode = jQuery.fn.apQrcode;

})(jQuery);