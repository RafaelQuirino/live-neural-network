export default function createRectangle (obj) {
    obj.Rectangle = function(x, y, width, height) {
        //Attributes
        this._type = obj.RECTANGLE;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        var p = new obj.Point(x, y);
        this._points = [
            p,
            new obj.Point(p._x + width, p._y),         
            new obj.Point(p._x + width, p._y + height),
            new obj.Point(p._x, p._y + height)          
        ];

        this.initialize();
        obj.stack.push(this);
    };
};