export default function createTextBox (obj) {
	obj.TextBox = function() {
		this.type = obj.TEXTBOX;
		
	    obj.stack.push(this);
	};
};