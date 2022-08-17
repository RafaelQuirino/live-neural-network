export default function Color (r,g,b) {
	this.r = r;
	this.g = g;
	this.b = b;

	this.red = function(red) { 
		if (arguments.length == 0) return this.r; 
		else if (arguments.length == 1) this.r = red;
	};

	this.green = function(green) { 
		if (arguments.length == 0) return this.g; 
		else if (arguments.length == 1) this.g = green;
	};

	this.blue = function(blue) { 
		if (arguments.length == 0) return this.b; 
		else if (arguments.length == 1) this.b = blue;
	};
	
	this.rgb = function(red, green, blue) {
		if (arguments.length == 0) {
			return 'rgb(' + [this.r, this.g, this.b].join(',') + ')';
		}
		else if (arguments.length == 3) {
			this.r = red;
			this.g = green;
			this.b = blue;
		} 
	};
};