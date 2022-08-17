import gfx from '../gfx/gfx_namespace';

export default function createBezierCurve (obj) {
	obj.BezierCurve = function() {
		this.type = gfx.BEZIERCURVE;

		gfx.stack.push(this);
	};
};