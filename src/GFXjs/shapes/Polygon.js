export default function createPolygon (obj) {
    obj.Polygon = function() {
        //Attributes
        this._type = obj.POLYGON;

        var poly = [];
        for (var i = 0; i < arguments.length-1; i += 2) {
            poly.push(new obj.Point(arguments[i], arguments[i+1]));
        }

        this._points = poly;

        //Create graph here, with points array

        this.initialize();
        obj.stack.push(this);
    };//obj.Polygon = function()
};