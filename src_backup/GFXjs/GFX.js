import __owl from './helpers/owl.js';
import __gfx from './gfx/gfx_namespace.js';
import __gfx_util from './util/util_namespace.js';
import __gfx_shapes from './shapes/shapes_namespace.js';
import __gfx_helpers from './helpers/helpers_namespace.js';
import __gfx_events from './events/events_namespace.js';

export default function GFX (canvasId) 
{
    var obj = __owl.deepCopy(__gfx);

    //Attributes
    obj.canvas = null;
    obj.context = null;
    obj.font = '12px Arial';
    obj.backgroundColor = new __gfx_util.Color(255,255,255);
    obj.foregroundColor = new __gfx_util.Color(0,0,0);
    obj.color = new __gfx_util.Color(0,0,0);
    obj.style = obj.STROKE;
    obj.thickness = 1;
    obj.width = 0;
    obj.height = 0;
    obj.selected = null;
    obj.ready = false;
    obj.preloadingAssets = [];
    obj.stack = [];
    obj.mouse = {
        position: {x: Infinity, y: Infinity},
        inside: false,
        down: false,
        moving: false,
        wheel: {
            moving: false,
            delta: 0,
            direction: null
        }
    };
    obj.touch = {
        position: null,
        inside: false,
        moving: false
    };
    obj.keyboard = {
        keysdown: []
    };
    obj.modes = {
        areaSelect: {
            on: false,
            shape: this.RECTANGLE,
            selected: [],
        },
        clickSelect: {
            on: false,
            selected: [],
        },
        drag: {
            on: false,
            inplace: false,
            dragging: false,
            draggingShape: null
        }
    };

    // Attributes accessors ---------------------------------------------------
    obj.dragAndDrop = function(flag) {
        obj.modes.drag.on = flag;
    };

    obj.setBackgroundColor = function(r,g,b) {
        if (arguments.length == 0) {

        } 
        else if (arguments.length == 3) {
            obj.backgroundColor.rgb(r,g,b);
        }
    };

    obj.setForegroundColor = function(r,g,b) {
        if (arguments.length == 0) {

        } 
        else if (arguments.length == 3) {
            obj.foregroundColor.rgb(r,g,b);
        }
    };
    //-------------------------------------------------------------------------

    // Constructor ------------------------------------------------------------
    obj.init = function(canvasId) {
        if (arguments.length == 0) {
            // Full page canvas created here
        } 
        else if (arguments.length == 1) {
            this.canvas = document.getElementById(canvasId);
            this.width = parseInt(this.canvas.width);
            this.height = parseInt(this.canvas.height);
            this.context = this.canvas.getContext('2d');
        } 
        else {
            throw 'Wrong arguments. Could not create GFX object.'
        }

        __gfx.createDrawingMode(this);
        __gfx_shapes.createShapes(this);
        __gfx_helpers.disableRightClick(this.canvas);

        __gfx_events.setMouseEvents(this);
        __gfx_events.setTouchEvents(this);
        __gfx_events.setKeyboardEvents(this);

        return this;
    };
    //-------------------------------------------------------------------------

    obj.addAsset = function(asset) {
        obj.preloadingAssets.push(asset);
        obj.ready = false;
    };

    obj.startPreloadingPoller = function(endCallback, progressCallback) {
        var preloadingPoller = setInterval(function() {
            var counter = 0;
            var total = obj.preloadingAssets.length;
            for (var i=0; i<total; i++) {
                if (obj.preloadingAssets[i].complete) {
                    counter++;
                }
            }
            if (counter == total) {
                if (progressCallback) progressCallback(100);
                endCallback();
                obj.ready = true;
                clearInterval(preloadingPoller);
            } else {
                if (progressCallback) {
                    counter++;
                    progressCallback(parseInt((counter / total) * 100));
                }
            }
        }, 10);
    };

    obj.render = function() {
        function renderFunc() {
            //Painting background
            var ctx = obj.context;
            ctx.fillStyle = obj.backgroundColor.rgb();
            ctx.fillRect(0, 0, obj.width, obj.height);

            for (var i = 0; i < obj.stack.length; i++) {
                if (obj.stack[i]._render) {
                    obj.stack[i].draw();
                }
            }
        }
        if (obj.ready) {
            renderFunc();
        } else {
            this.startPreloadingPoller(function() {
                renderFunc();	
            });
        }
    };

    //Overloaded method
    obj.clear = function(x, y, width, height) {
        var ctx = obj.context;
        if (arguments.length == 0) {
            ctx.clearRect(0, 0, obj.width, obj.height);
        } 
        else if (arguments.length == 4) {    
            ctx.clearRect(x, y, width, height);
        } 
        else if (arguments.length == 1) {    
            //Clear the area of a given shape
        }
    };

    obj.updateScreen = function() {
        obj.clear();
        obj.render();
    };

    return obj.init(canvasId);

}//function GFX