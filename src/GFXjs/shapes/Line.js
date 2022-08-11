export default function createLine (obj) {
    obj.Line = function(x1, y1, x2, y2) {
        //Attributes
    	this._type = obj.LINE;
        this._p1 = new obj.Point(x1, y1);
        this._p2 = new obj.Point(x2, y2);
        this._points = [this._p1, this._p2];
        //this._thickness = 1;

        //Methods
        this.getLength = function() {
            Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
        };

        // this.thickness = function(x) {
        //     this._thickness = x;
        // }

        obj.stack.push(this);
    };
};
