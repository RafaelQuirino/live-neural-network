export default function createCircle (obj) {
    obj.Circle = function(x, y, radius){
        //Attributes
        this._type = obj.CIRCLE;
    	this._center = new obj.Point(x,y);
    	this._radius = radius;
    	this._points = [this._center]; //Implement segmented circle

        //Methods
    	this.draw = function(type) {
    		if (type == undefined)
      		    type = this._style;
            else if (type != obj.STROKE && type != obj.FILL)
      		    throw new TypeError('Wrong draw type, must be \"stroke\" or \"fill\".');
        
            var xc = this._points[0]._x, yc = this._points[0]._y;
            var rate = 0.5, ctx = obj.context;

            ctx.beginPath();
            ctx.arc(xc + rate , yc + rate, this._radius, 0, 2*Math.PI);
            ctx.closePath();

            ctx[type+'Style'] = this._color.rgb();
            ctx[type]();

            if (this._renderBorder) {
                ctx.beginPath();
                ctx.arc(xc + rate , yc + rate, this._radius, 0, 2*Math.PI);
                ctx.closePath();

                ctx['strokeStyle'] = this._borderColor.rgb();
                ctx.lineWidth = this._borderThickness;
                ctx['stroke']();
            }
    	};//this.draw = function(type)

        this.hasPoint = function() {
            var x, y;
        
            if (arguments.length == 1) {
                x = arguments[0].x;
                y = arguments[0].y;
            } else if (arguments.length == 2) {
                x = arguments[0];
                y = arguments[1];
            } else { //Throw an error
                var str = 'Error calling ' + this.type + '.hasPoint(';
                for(var i = 0; i < arguments.length-1; i++) str += arguments[i] + ', ';
                str += arguments[arguments.length-1] + '). ';
                str += 'Graphics.Point instance or (x, y) coordinates expected.';
                throw str;
            }

            var distance = Math.sqrt(Math.pow(this._center._x - x, 2) + Math.pow(this._center._y - y, 2));
            if (distance <= this._radius) return true;
            return false;
        };//this.hasPoint = function()

        obj.stack.push(this);
    };//obj.Circle = function(x, y, radius)
};