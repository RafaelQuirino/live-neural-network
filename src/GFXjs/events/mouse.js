import __gfx_helpers from '../helpers/helpers_namespace.js';

export default function setMouseEvents (obj) {
    var useCapture = false;

    //Mouse enter
    obj.canvas.addEventListener('mouseenter', function(event) {
        //Initializations
        obj.mouse.inside = true;
        __gfx_helpers.events.disable();

        //Code ----------------------------------------------------------------

        //End of code ---------------------------------------------------------

        //Finalizations
        //...
    }, useCapture);

    //Mouse leave
    obj.canvas.addEventListener('mouseleave', function(event) {
        //Initializations
        obj.mouse.inside = false;
        obj.mouse.down = false;
        obj.mouse.position = null;
        obj.modes.drag.dragging = false;
        __gfx_helpers.events.enable();

        //Code ----------------------------------------------------------------

        //End of code ---------------------------------------------------------

        //Finalizations
        //...
    }, useCapture);

    //Mouse down
    obj.canvas.addEventListener('mousedown', function(event) {
        //Initializations
        obj.mouse.down = true;
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);
        obj.mouse.position = {x: pos.x, y: pos.y};

        //Code ----------------------------------------------------------------
        if (obj.modes.drag.on) {
            var shape = null;
            for (var i = obj.stack.length-1; i >= 0; i--) {
                var currshape = obj.stack[i];
                if (currshape._selectable) {
                    if (currshape.hasPoint(pos.x, pos.y)) {
                        shape = currshape;
                        break;
                    }
                }
            }
            if (shape) {
                if (shape.draggable) {
                    obj.modes.drag.draggingShape = shape;
                }
            }
        }//if (obj.modes.drag.on)
        //End of code ---------------------------------------------------------

        //Finalizations
        //...
    }, useCapture);

    //Mouse up
    obj.canvas.addEventListener('mouseup', function(event) {
        //Initializations
        obj.mouse.down = false;
        obj.modes.drag.draggingShape = null;
        obj.modes.drag.dragging = false;
        obj.modes.drag.inplace = false;
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);

        //Code ----------------------------------------------------------------

        //End of code ---------------------------------------------------------

        //Finalizations
        obj.selectedShape = null;
    }, useCapture);

    //Mouse move
    obj.canvas.addEventListener('mousemove', function(event) {
        //Initializations
        obj.mouse.moving = true;
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);

        //Code ----------------------------------------------------------------
        if (obj.modes.drag.on) {
            if (obj.mouse.inside && obj.mouse.down) {
                obj.modes.drag.dragging = true;
                if (obj.modes.drag.draggingShape) {
                    var shape = obj.modes.drag.draggingShape;
                    var dx = pos.x - obj.mouse.position.x;
                    var dy = pos.y - obj.mouse.position.y;

                    if (!obj.modes.drag.inplace) {
                        shape.bringToTop();
                    }
                    shape.translate(dx,dy);
                    obj.updateScreen();
                }
            }
        }
        //End of code ---------------------------------------------------------

        //Finalizations
        obj.mouse.position = {x: pos.x, y: pos.y};
        obj.mouse.moving = false;
    }, useCapture);

    //Mouse click
    obj.canvas.addEventListener('click', function(event) {
        //Initializations
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);

        //Code ----------------------------------------------------------------

        //---------------------------------------------------------------------

        //Finalizations
        //...
    }, useCapture);

    //Mouse double click
    obj.canvas.addEventListener('dblclick', function(event) {
        //Initializations
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);

        //Code ----------------------------------------------------------------

        //---------------------------------------------------------------------

        //Finalizations
        //...
    }, useCapture);

    //Mouse right click
    obj.canvas.addEventListener('contextmenu', function(event) {
        //Initializations
        var pos = __gfx_helpers.getMousePos(obj.canvas, event);

        //Code ----------------------------------------------------------------
        obj.modes.drag.inplace = true;
        //End of code ---------------------------------------------------------

        //Finalizations
    }, useCapture);

    //Mouse wheel
    obj.canvas.addEventListener('wheel', function(event) {
        //Initializations
        obj.mouse.wheel.moving = true;
        obj.mouse.wheel.delta = event.wheelDelta;
        //Not working properly in firefox...
        obj.mouse.wheel.direction = event.wheelDelta > 0 ? 'up' : 'down';

        //Code ----------------------------------------------------------------
    
        //---------------------------------------------------------------------

        //Finalizations
        obj.mouse.wheel.moving = false;
    }, useCapture);
};//events.setMouseEvents = function(obj)