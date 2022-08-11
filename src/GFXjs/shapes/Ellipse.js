import gfx from '../gfx/gfx_namespace';

export default function createEllipse (obj) {
	obj.Ellipse = function() {
		//Atributes
	    this.type = gfx.ELLIPSE;
	    this.x = x;
	    this.y = y;
	    this.width = width;
	    this.height = height;

	    gfx.stack.push(this);
	};
};