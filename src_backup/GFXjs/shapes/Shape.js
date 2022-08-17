import __gfx_util from '../util/util_namespace.js';
import __gfx_helpers from '../helpers/helpers_namespace.js';

export default function createShape (obj) {
    //Contructor
    obj.Shape = function() {
        this._name = '';
        this._type = 'Shape';
        this._style = obj.STROKE;
        this._thickness = 1;
        this._dashed = false;
        this._lineDash = [5];
        this._lineDashOffset = 0;
        this._color = new __gfx_util.Color(0,0,0);

        this._renderBorder = false;
        this._borderStyle = obj.STROKE;
        this._borderThickness = 1;
        this._dashedBorder = false;
        this._borderLineDash = [5];
        this._borderLineDashOffset = 0;
        this._borderColor = new __gfx_util.Color(0,0,0);

        this._points = [];
        this._graph = {};
        this._alpha = 1;
        this._selectable = true;
        this._draggable = true;
        this._render = true;
        this._renderBoundingBox = false;
        this._renderCenter = false;
        this._boundingBox = null;
        this._boundingBoxCenter = null;
        this._inclination = 0;

        // Every shape will have to save its original form,
        // and its transformations history
        this._origins = {};
        this._history = [];
    };

    //Abstract methods
    obj.Shape.prototype = {
        constructor: obj.Shape,

        //Attributes accessors ----------------------------------------------------
        name: function() {
            if (arguments.length == 0) return this._name;
            else if (arguments.length == 1) this._name = arguments[0];
        },

        type: function() {
            if (arguments.length == 0) return this._type;
            else if (arguments.length == 1) this._type = arguments[0];
        },

        style: function() {
            if (arguments.length == 0) return this._style;
            else if (arguments.length == 1) {
                if (arguments[0] == obj.DASHED) {
                    this._style = obj.STROKE;
                    this._dashed = true;
                } else {
                    this._style = arguments[0];
                    this._dashed = false;
                }
            }
        },

        color: function() {
            if (arguments.length == 0) return this._color;
            else if (arguments.length == 3) {
                this._color = new __gfx_util.Color(arguments[0], arguments[1], arguments[2]);
            }
        },

        renderBorder: function() {
            if (arguments.length == 0) return this._renderBorder;
            else if (arguments.length == 1) this._renderBorder = arguments[0];
        },

        borderStyle: function() {
            if (arguments.length == 0) return this._borderStyle;
            else if (arguments.length == 1) {
                if (arguments[0] == obj.DASHED) {
                    this._borderStyle = obj.STROKE;
                    this._borderDashed = true;
                } else {
                    this._borderStyle = arguments[0];
                    this._borderDashed = false;
                }
            }
        },

        borderColor: function() {
            if (arguments.length == 0) return this._borderColor;
            else if (arguments.length == 1) this._borderColor = arguments[0];
            else if (arguments.length == 3) {
                var r = arguments[0];
                var g = arguments[1];
                var b = arguments[2];
                this._borderColor = new __gfx_util.Color(r,g,b);
            }
        },

        thickness: function() {
            if (arguments.length == 0) return this._thickness;
            else if (arguments.length == 1) this._thickness = arguments[0];
        },

        borderThickness: function() {
            if (arguments.length == 0) return this._borderThickness;
            else if (arguments.length == 1) this._borderThickness = arguments[0];
        },

        points: function() {
            if (arguments.length == 0) return this._points;
            else if (arguments.length == 1) this._points = arguments[0];
        },

        graph: function() {
            if (arguments.length == 0) return this._render;
            else if (arguments.length == 1) this._render = arguments[0];
        },

        alpha: function() {
            if (arguments.length == 0) return this._alpha;
            else if (arguments.length == 1) this._alpha = arguments[0];
        },

        selectable: function() {
            if (arguments.length == 0) return this._selectable;
            else if (arguments.length == 1) this._selectable = arguments[0];
        },

        draggable: function() {
            if (arguments.length == 0) return this._draggable;
            else if (arguments.length == 1) this._draggable = arguments[0];
        },

        render: function() {
            if (arguments.length == 0) return this._render;
            else if (arguments.length == 1) this._render = arguments[0];
        },

        renderBoundingBox: function() {
            if (arguments.length == 0) return this._renderBoundingBox;
            else if (arguments.length == 1) this._renderBoundingBox = arguments[0];
        },

        renderCenter: function() {
            if (arguments.length == 0) return this._renderCenter;
            else if (arguments.length == 1) this._renderCenter = arguments[0];
        },
        //-------------------------------------------------------------------------

        initialize: function() {
            this.setBoundaries();
            this.saveOrigins();
        },

        toString: function() {
            var str = '{id: ' + this.idx() +
            ', Name: "' + this._name + '", Type: ' + this._type +
            ', Color: ' + this._color.rgb() + ', Points: [';

            var size = this._points.length;
            for (var i = 0; i < size-1; i++) {
                str += '(' + this._points[i]._x + ', ' + this._points[i]._y + '), ';
            }
            if (size == 0) str += ']';
            else str += '(' + this._points[size-1]._x + ', ' + this._points[size-1]._y + ')]';

            str += '}';

            return str;
        },

        // Canvas can't stroke 1px lines unless it calculates from half
        // (0.5) pixels. That's the reason to put +0.5 (rate) on drawing.
        draw: function(type) {
            //Validation
            if (type == undefined) {
      		    type = this._style;
            }
            else if (type != obj.STROKE && type != obj.FILL) {
      		    throw new TypeError('Wrong draw type, must be \"stroke\" or \"fill\".');
            }

            var rate = 0.5, ctx = obj.context;

            ctx.beginPath();
            if (this._dashed) {
                ctx.setLineDash(this._lineDash);
                ctx.lineDashOffset = this._lineDashOffset;
            }
            ctx.moveTo(this._points[0]._x+rate, this._points[0]._y+rate);
            for (var i = 1; i < this._points.length; i++) {
                ctx.lineTo(this._points[i]._x+rate, this._points[i]._y+rate);
            }
            ctx.closePath();

            ctx[type+'Style'] = this._color.rgb();
            ctx.lineWidth = this._thickness;
            ctx.globalAlpha = this._alpha;
            ctx[type]();

            ctx.globalAlpha = 1;
            ctx.setLineDash([0]);

            if (this._renderBorder) {
                ctx.beginPath();
                if (this._borderDashed) {
                    ctx.setLineDash(this._borderLineDash);
                    ctx.lineDashOffset = this._borderLineDashOffset;
                }
                ctx.moveTo(this._points[0]._x+rate, this._points[0]._y+rate);
                for (var i = 1; i < this._points.length; i++) {
                    ctx.lineTo(this._points[i]._x+rate, this._points[i]._y+rate);
                }
                ctx.closePath();

                ctx.strokeStyle = this._borderColor.rgb();
                ctx.lineWidth = this._borderThickness;
                ctx.globalAlpha = this._alpha;
                ctx.stroke();

                ctx.globalAlpha = 1;
                ctx.setLineDash([0]);
            }

            if (this._renderBoundingBox) {
                if (this._boundingBox) {
                    var bbpts = this._boundingBox;//calculateBoundingBox();

                    ctx.beginPath();
                    ctx.moveTo(bbpts[0].x+rate, bbpts[0].y+rate);
                    for (var i = 1; i < bbpts.length; i++) {
                        ctx.lineTo(bbpts[i].x+rate, bbpts[i].y+rate);
                    }
                    ctx.closePath();

                    ctx.strokeStyle = 'rgb(0,0,0)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (this._renderCenter) {
                if (this._boundingBoxCenter) {
                    var center = this._boundingBoxCenter;//calculateBoundingBoxCenter()
                    ctx.beginPath();
                    ctx.arc(center.x + rate , center.y + rate, 2, 0, 2*Math.PI);
                    ctx.closePath();

                    ctx['fillStyle'] = 'rgb(0,0,0)';
                    ctx['fill']();
                }
            }
        },//draw: function(type)

        stroke: function() {
            obj.context.lineWidth = 1;
            this.draw(obj.STROKE);
        },

        fill: function() {
            this.draw(obj.FILL);
        },

        //Overloaded method
        hasPoint: function() {
            var x, y;
            if (arguments.length == 1) {
                x = arguments[0].x;
                y = arguments[0].y;
            } else if (arguments.length == 2) {
                x = arguments[0];
                y = arguments[1];
            } else { //Throw an error
                var str = 'Error calling ' + this.type() + '.hasPoint(';
                for(var i = 0; i < arguments.length-1; i++) str += arguments[i] + ', ';
                str += arguments[arguments.length-1] + '). ';
                str += 'GFX.Point instance or (x, y) coordinates expected.';
                throw str;
            }

            var poly = this._points;
            var j = poly.length - 1;
            var result = false;
            for (i = 0; i < poly.length; i++) {
                if (((poly[i]._y > y) != (poly[j]._y > y)) &&
                    (x < (poly[j]._x - poly[i]._x) * (y - poly[i]._y) / (poly[j]._y - poly[i]._y) + poly[i]._x)) {
                    result = !result;
                }
                j = i;
            }
            return result;
        },//hasPoint: function()

        stackIndex: function() {
            var index = -1;
            for (var i = 0; i < obj.stack.length; i++) {
                if (this.idx() == obj.stack[i].idx()) {
                    index = i;
                    break;
                }
            }
            return index;
        },

        bringToTop: function() {
            obj.stack.splice(this.stackIndex(), 1);
            obj.stack.push(this);
        },

        calculateBoundingBox: function() {
            var xarr = [], yarr = [];
            for (var i = 0; i < this._points.length; i++) {
                xarr.push(this._points[i].x());
                yarr.push(this._points[i].y());
            }

            //From top-left corner, clockwise
            var p1 = {x: __gfx_helpers.min(xarr), y: __gfx_helpers.min(yarr)};
            var p2 = {x: __gfx_helpers.max(xarr), y: __gfx_helpers.min(yarr)};
            var p3 = {x: __gfx_helpers.max(xarr), y: __gfx_helpers.max(yarr)};
            var p4 = {x: __gfx_helpers.min(xarr), y: __gfx_helpers.max(yarr)};

            return [p1, p2, p3, p4];
        },

        calculateBoundingBoxCenter: function() {
            var bb = this.calculateBoundingBox();
            var x = bb[0].x + __gfx_helpers.distance(bb[0], bb[1]) / 2;
            var y = bb[0].y + __gfx_helpers.distance(bb[1], bb[2]) / 2;
            return {x: x, y: y};
        },

        setBoundaries: function() {
            this._boundingBox = this.calculateBoundingBox();
            this._boundingBoxCenter = this.calculateBoundingBoxCenter();
        },

        getBoundaryPoints: function(currBounds) {
            var bounds = currBounds ? currBounds : this._boundingBox;
            var bpts = [], lines = [];

            for(var i = 0; i < 4; i++) {
                bpts.push([]);
            }

            for (var i = 0; i < bounds.length; i++) {
                var idx1 = i, idx2 = i + 1 == bounds.length ? 0 : i + 1;
                var pt1 = bounds[idx1], pt2 = bounds[idx2];
                lines.push({pt1: pt1, pt2: pt2});
            }

            for (var lidx = 0; lidx < lines.length; lidx++) {
                var line = lines[lidx];

                for (var i = 0; i < this._points.length; i++) {
                    var point = this._points[i];

                    var x1 = line.pt1.x, y1 = line.pt1.y;
                    var x2 = line.pt2.x, y2 = line.pt2.y;
                    var x3 = point._x, y3 = point._y;

                    var det = (x1*y2) + (y1*x3) + (x2*y3) - (y1*x2) - (x1*y3) - (y2*x3);

                    if (det == 0) {
                        bpts[lidx].push({x: point._x, y: point._y});
                    }
                }
            }

            return bpts;
        },

        getCurrentBoundaryPoints: function() {
            var bb = this.calculateBoundingBox();
            var boundpts = this.getBoundaryPoints(bb);
            return boundpts;
        },

        saveOrigins: function(){
            //Save points
            this._origins.points = [];
            for (var i = 0; i < this._points.length; i++) {
                this._origins.points.push({
                    x: this._points[i].x(),
                    y: this._points[i].y()
                });
            }

            //Save boundingBox
            this._origins.boundingBox = [];
            for (var i = 0; i < this._boundingBox.length; i++) {
                this._origins.boundingBox.push({
                    x: this._boundingBox[i].x,
                    y: this._boundingBox[i].y
                });
            }

            //Save boundingBoxCenter
            this._origins.boundingBoxCenter = {
                x: this._boundingBoxCenter.x,
                y: this._boundingBoxCenter.y
            };
        },

        restoreOrigins: function(){
            //Restore points
            this._points = [];
            for (var i = 0; i < this._origins.points.length; i++) {
                var pt = new obj.Point(this._origins.points[i].x, this._origins.points[i].y);
                this._points.push(pt);
            }

            //Restore boundingBox
            this._boundingBox = [];
            for (var i = 0; i < this._origins.boundingBox.length; i++) {
                var pt = {
                    x: this._origins.boundingBox[i].x,
                    y: this._origins.boundingBox[i].y
                };
                this._boundingBox.push(pt);
            }

            //Restore boundingBoxCenter
            this._boundingBoxCenter = {
                x: this._origins.boundingBoxCenter.x,
                y: this._origins.boundingBoxCenter.y
            };
        },

        //=====================================================================
        //TRANSFORMATIONS
        //=====================================================================
        translate: function(dx, dy) {
            for (var i = 0; i < this._points.length; i++) {
                this._points[i]._x += dx;
                this._points[i]._y += dy;
            }

            if (this._x && this._y) {
                this._x = this._points[0]._x;
                this._y = this._points[0]._y;
            }

            if (this._boundingBox) {
                for (var i = 0; i < this._boundingBox.length; i++) {
                    this._boundingBox[i].x += dx;
                    this._boundingBox[i].y += dy;
                }
            }

            if (this._boundingBoxCenter) {
                this._boundingBoxCenter.x += dx;
                this._boundingBoxCenter.y += dy;
            }
        },

        rotate: function(angle, pivot) {

        },

        scale: function(grow) {
            var bb = this._boundingBox;
            var bbcenter = this._boundingBoxCenter;

            if (grow != 0) {
                //First calculate the distance of the new lines from the center
                var dist = 0;
                if (grow > 0) {

                } else if (grow < 0) {

                }

                //Then grow the bounding box
                var newbb = __gfx_helpers.expandPoly(bb, dist);
                this._boundingBox = newbb;

                console.log('Old bounding box:');
                console.log(bb);
                console.log('New bounding box:');
                console.log(newbb);

                //Now recalculate shape's points...
            }
        },

        /*
        scale: function(distance, axis) {
            if (axis) {
                var currbounds = this.getCurrentBoundaries();
                var usefullbounds = [];

                if (axis == obj.X_AXIS) {
                    usefullbounds.push(currbounds[1]);
                    usefullbounds.push(currbounds[3]);
                } else if (axis == obj.Y_AXIS) {
                    usefullbounds.push(currbounds[0]);
                    usefullbounds.push(currbounds[2]);
                }
            } else {
                var p = [];
                for (var i = 0; i < this._points.length; i++) {
                    p.push({x: this._points[i]._x, y: this._points[i]._y});
                }

                var rot = __gfx_helpers.polyIsCw(p) ? __gfx_helpers.vecRot90CCW : __gfx_helpers.vecRot90CW;
                var expanded = [];

                for (var i = 0; i < p.length; i++) {

                    // get this point (pt1), the point before it
                    // (pt0) and the point that follows it (pt2)
                    var pt0 = p[(i > 0) ? i - 1 : p.length - 1];
                    var pt1 = p[i];
                    var pt2 = p[(i < p.length - 1) ? i + 1 : 0];

                    // find the line vectors of the lines going
                    // into the current point
                    var v01 = { x: pt1.x - pt0.x, y: pt1.y - pt0.y };
                    var v12 = { x: pt2.x - pt1.x, y: pt2.y - pt1.y };

                    // find the normals of the two lines, multiplied
                    // to the distance that polygon should inflate
                    var d01 = __gfx_helpers.vecMul(__gfx_helpers.vecUnit(rot(v01)), distance);
                    var d12 = __gfx_helpers.vecMul(__gfx_helpers.vecUnit(rot(v12)), distance);

                    // use the normals to find two points on the
                    // lines parallel to the polygon lines
                    var ptx0  = { x: pt0.x + d01.x, y: pt0.y + d01.y };
                    var ptx10 = { x: pt1.x + d01.x, y: pt1.y + d01.y };
                    var ptx12 = { x: pt1.x + d12.x, y: pt1.y + d12.y };
                    var ptx2  = { x: pt2.x + d12.x, y: pt2.y + d12.y };

                    // find the intersection of the two lines, and
                    // add it to the expanded polygon
                    expanded.push(__gfx_helpers.intersect([ptx0, ptx10], [ptx12, ptx2]));
                }

                for (var i = 0; i < this._points.length; i++) {
                    this._points[i]._x = expanded[i].x;
                    this._points[i]._y = expanded[i].y;
                }

                this.setBoundaries(); //no..., or yes ?
            }
        },
        */

        // Side is what it tells.
        // If you choose the x axis, side is either up or down of the shape
        // If you choose the y axis, then side is either left or right
        reflect: function(axis, side) {

        },

        // Make a shape attach to a given bounding box, even if its distorted
        attach: function(squaredArea) {
                        //This asserts top-left clockwise orientation
            var newbb = __gfx_helpers.calculateBoundingBox(squaredArea);
            var points = [];
            for (var i = 0; i < this._points.length; i++) {
                points.push({
                    x: 0,
                    y: 0
                });
            }
        },

        inclination: function(angle) {
            if (arguments.length == 0) {
                return this._inclination;
            }

            if (angle == 0) {

                this.restoreOrigins();
                this._iclination = 0;
                return;

            } else if (Math.abs(angle) < 90) {

                this.restoreOrigins();
                this._inclination = angle;

                //Original (flat) bounding box points (from top-left, clockwise)
                var bb = this._boundingBox;
                var pt1 = {x: bb[0].x, y: bb[0].y};
                var pt2 = {x: bb[1].x, y: bb[1].y};
                var pt3 = {x: bb[2].x, y: bb[2].y};

                var dx = __gfx_helpers.distance(pt1, pt2);
                var dy = __gfx_helpers.distance(pt2, pt3);
                var anglerad = (Math.PI * angle) / 180;
                var sin = Math.sin(anglerad);

                //These are, in fact, the max dx and max dy for points in bounding box right line;
                //dx always get smaller for this kind of inclination
                var maxdx = (dx - Math.sqrt((Math.pow(dx,2) - Math.pow(sin * dx,2)))) * -1;
                var maxdy = angle > 0 ? -(Math.abs(sin * dx)) : Math.abs(sin * dx);

                //Incline center
                var cx = this._boundingBoxCenter.x;
                var cy = this._boundingBoxCenter.y;
                var crate = (cx - pt1.x)/dx;
                this._boundingBoxCenter.x = cx + maxdx*crate;
                this._boundingBoxCenter.y = cy + maxdy*crate;

                //Incline boundingBox
                for (var i = 0; i < this._boundingBox.length; i++) {
                    if (i != 0 && i != 3) {
                        this._boundingBox[i].x += maxdx;
                        this._boundingBox[i].y += maxdy;
                    }
                }

                //Incline shape
                for (var i = 0; i < this._points.length; i++) {
                    var px = this._points[i].x();
                    var py = this._points[i].y();
                    var prate = (px - pt1.x)/dx;
                    this._points[i].x(px + maxdx*prate);
                    this._points[i].y(py + maxdy*prate);
                }

            } else {
                throw 'Angle must be between -90 and 90 degrees.'
            }
        }//inclination: function(angle)
        // End of transformations =============================================
    };//obj.Shape.prototype = function()
};//__gfx_shapes.createShape = function(obj)