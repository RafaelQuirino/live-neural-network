import gfx from '../gfx/gfx_namespace';

export default function createQuadraticCurve (obj) {
	obj.QuadraticCurve = function() {
		this.type = gfx.QUADRATICCURVE;

		gfx.stack.push(this);
	};
};