import gfx from '../gfx/gfx_namespace';

export default function createSquare (obj) {
    obj.Square = function(x, y, side) {
        //Attributes
        this.type = gfx.SQUARE;
    	this.x = x;
        this.y = y;
        this.side = side;
        var p = new gfx.Point(x, y);
        this.points = [
            p,
            new gfx.Point(p.x + side, p.y),         
            new gfx.Point(p.x + side, p.y + side),
            new gfx.Point(p.x, p.y + side)          
        ];

        this.initialize();
        gfx.stack.push(this);
    };
};