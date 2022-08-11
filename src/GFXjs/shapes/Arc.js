import gfx from '../gfx/gfx_namespace';

export default function createArc (obj) {
	obj.Arc = function() {
		this.type = gfx.ARC;

		gfx.stack.push(this);
	};
};