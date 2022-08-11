import Color from './Color.js';

export default function Pixel (x, y, r, g, b, a) {
	this.x = x;
	this.y = y;
	this.color = new Color(r, g, b);
	this.alpha = a;

	this.draw = function() {

	};
};