export default function createDrawingMode (obj) {
    //Text mode ---------------------------------------------------------------
    obj.getFont = function() { return obj.context.font; };
    obj.setFont = function(font) { obj.context.font = font; };
    obj.fillText = function(text, x, y) { 
		obj.context.font=obj.font; //"30px Arial";
        obj.context.fillStyle = obj.foregroundColor.rgb();
        obj.context.fillText(text, x, y); 
    };
    //End of text mode --------------------------------------------------------

    //Image mode --------------------------------------------------------------
    obj.drawImage = function(img, x, y, width, heigth){
        this.context.drawImage(img, x, y, width, heigth);
    };
    //End of image mode -------------------------------------------------------

    //Line
    obj.drawLine = function(){};

    //Rect
    obj.drawRect = function(x, y, width, height){
        var rate = 0.5, ctx = this.context;
        ctx.strokeStyle = obj.foregroundColor.rgb();
        ctx.lineWidth = obj.thickness;
        ctx.strokeRect(x+rate, y+rate, width, height);
    };
    obj.fillRect = function(x, y, width, height, options){
        var rate = 0.5, ctx = obj.context;
        ctx.fillStyle = obj.foregroundColor.rgb();
        if (options.color) {
            var r = options.color.red;
            var g = options.color.green;
            var b = options.color.blue;
            var a = 1;
            if (options.alpha) a = options.alpha;
            ctx.fillStyle = 'rgba(' + [r,g,b,a].join(',') + ')';
        }
        if (options.alpha)
        ctx.fillRect(x+rate, y+rate, width, height);
    };

    //Square
    obj.drawSquare = function(){};
    obj.fillSquare = function(){};

    //Polygon
    obj.drawPolygon = function(){};
    obj.fillPolygon = function(){};

    //Circle
    obj.drawCircle = function(){};
    obj.fillCircle = function(xc, yc, rd, r, g, b){
        var rate = 0.5, ctx = obj.context;

        ctx.beginPath();
        ctx.arc(xc + rate , yc + rate, rd, 0, 2*Math.PI);
        ctx.closePath();

        var rgb = 'rgb(0,0,0)';
        if (arguments.length == 6) rgb = 'rgb(' + [r,g,b].join(',') + ')';

        ctx['fillStyle'] = rgb;
        ctx['fill']();
    };

    //Ellipse
    obj.drawEllipse = function(){};
    obj.fillEllipse = function(){};
};