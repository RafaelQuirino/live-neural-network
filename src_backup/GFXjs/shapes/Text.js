export default function createText (obj) {
    obj.Text = function(str, x, y) {
        this._type = obj.TEXT;
        this._text = str;
        this._x = x;
        this._y = y;
        this._font = obj.font;
        this._points = [new obj.Point(x, y)];

        this.text = function(text) { 
            if (arguments.length == 0) return this._text;
            else if (arguments.length == 1) this._text = text; 
        },
        this.x = function(x) { 
            if (arguments.length == 0) return this._x;
            else if (arguments.length == 1) this._x = x; 
        },
        this.y = function(y) { 
            if (arguments.length == 0) return this._y;
            else if (arguments.length == 1) this._y = y; 
        },
        this.font = function(font) { 
            if (arguments.length == 0) return this.font;
            else if (arguments.length == 1) this.font = font; 
        },

        this.draw = function() {
            // obj.setColor(this._color);
            // obj.setFont(this._font);
            obj.fillText(this._text, this._x, this._y);
        };

        obj.stack.push(this);
    };
};