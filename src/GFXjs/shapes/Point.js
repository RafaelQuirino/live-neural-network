export default function createPoint (obj) {
    obj.Point = function(x, y, stack) {
        //Atributes
        this._type = obj.POINT;
        this._x = x;
        this._y = y;
        this._radius = 0;
        this._render = false;
        this._stack = stack || false;

        //Attributes accessors
        this.x = function(n) { 
            if (arguments.length == 0) return this._x;
            else if (arguments.length == 1) this._x = n; 
        };
        this.y = function(n) { 
            if (arguments.length == 0) return this._y;
            else if (arguments.length == 1) this._y = n; 
        };
        this.radius = function(radius) { 
            if (arguments.length == 0) return this._radius;
            else if (arguments.length == 1) this._radius = radius; 
        };
        this.render = function(render) { 
            if (arguments.length == 0) return this._render;
            else if (arguments.length == 1) this._render = render; 
        };
        this.stack = function(stack) { 
            if (arguments.length == 0) return this._stack;
            else if (arguments.length == 1) this._stack = stack; 
        };

        //Methods
        this.draw = function(radius, type) {
            var rd = radius, t = type;
            //Overload
            if (arguments.length == 0) {
                rd = this.radius();
                t = this.style();
            } else if (arguments.length == 1) {
                rd = arguments[0];
            }

            if (this.render()) {  
                var rate = 0.5, ctx = obj.context;
                ctx.beginPath();
                ctx.arc(x+rate , y+rate, rd, 0, 2*Math.PI);
                ctx.closePath();

                ctx[t+'Style'] = this._color.rgb();
                ctx[t]();
            }
        };

        if (this._stack) obj.stack.push(this);
    };
};
