import createShape from './Shape.js';
import createPoint from './Point.js';
import createLine from './Line.js';
import createPolyline from './Polyline.js';
import createRectangle from './Rectangle.js';
import createSquare from './Square.js';
import createPolygon from './Polygon.js';
import createArc from './Arc.js';
import createQuadraticCurve from './QuadraticCurve.js';
import createBezierCurve from './BezierCurve.js';
import createEllipse from './Ellipse.js';
import createCircle from './Circle.js';
import createText from './Text.js';
import createTextBox from './TextBox.js';
import createImage from './Image.js';

export default {
	createAllShapes: function(obj) {
        createShape(obj);
        createPoint(obj);
        createLine(obj);
        createPolyline(obj);
        createRectangle(obj);
        createSquare(obj);
        createPolygon(obj);
        createArc(obj);
        createQuadraticCurve(obj);
        createBezierCurve(obj);
        createEllipse(obj);
        createCircle(obj);
        createText(obj);
        createTextBox(obj);
        createImage(obj);
    },

    createInheritance: function(obj) {
        var s = new obj.Shape();
        obj.Point.prototype = s;
        obj.Line.prototype = s;
        obj.Polyline.prototype = s;
        obj.Rectangle.prototype = s;
        obj.Square.prototype = s;
        obj.Polygon.prototype = s;
        obj.Arc.prototype = s;
        obj.QuadraticCurve.prototype = s;
        obj.BezierCurve.prototype = s;
        obj.Ellipse.prototype = s;
        obj.Circle.prototype = s;
        obj.Text.prototype = s;
        obj.TextBox.prototype = s;
        obj.Image.prototype = s;
    },

    createShapes: function(obj) {
        this.createAllShapes(obj);
        this.createInheritance(obj);
    }
};