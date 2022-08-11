export default function createImage (obj) {
    obj.Image = function(src, x, y, width, height) {
        var img = new Image();
        img.src = src;

        obj.addAsset(img);

        //Attributes
        this._type = 'Image';
        this._img = img;
        this._src = src;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        var p = new obj.Point(x, y);
        this._points = [
            p,
            new obj.Point(p._x + width, p._y),         
            new obj.Point(p._x + width, p._y + height),
            new obj.Point(p._x, p._y + height)          
        ];

        //Getting the pixels of the image
        ///*
        this._imageData = null;
        this._pixels = [];
        var that = this;

        obj.startPreloadingPoller(function() {
            obj.clear();

            console.log(that._img);
            console.log(that._x);
            console.log(that._y);
            console.log(that._width);
            console.log(that._height);

            obj.drawImage(that._img, that._x, self._y, that._width, that._height);
            var imageData = obj.context.getImageData(that._x, that._y, that._width, that._height);
            that._imageData = imageData;

            console.log(that._imageData);

            /*
            for (var y = 0; y < that._height; y++) {
                for (var x = 0; x < that._width; x++) {
                    var r = imageData.data[((that._width * y) + x) * 4];
                    var g = imageData.data[((that._width * y) + x) * 4 + 1];
                    var b = imageData.data[((that._width * y) + x) * 4 + 2];
                    var a = imageData.data[((that._width * y) + x) * 4 + 3];

                    var pxl = new __gfx_util.Pixel(x,y,r,g,b,a);
                    that._pixels.push(pxl);
                }
            }
            */

            // iterate over all pixels
            for(var i = 0, n = imageData.data.length; i < n; i += 4) {
                var r = imageData.data[i];
                var g = imageData.data[i + 1];
                var b = imageData.data[i + 2];
                var a = imageData.data[i + 3];

                var pxl = new __gfx_util.Pixel(0,0,r,g,b,a);
                that._pixels.push(pxl);
            }

            obj.updateScreen();
        });//obj.startPreloadingPoller(function()
        //*/

        this.draw = function() {
            //console.log(this._pixels);
            //console.log('Inside Image draw()...');

            var rate = 0.5, ctx = obj.context;

            //console.log(this._img);
            //console.log(this._x);
            //console.log(this._y);
            //console.log(this._width);
            //console.log(this._height);

            //console.log(this);

            //Gotta change this, need to draw each pixel...
            obj.drawImage(this._img, this._x, this._y, this._width, this._height);

            //for (var i = 0; i < this.pixels.length; i++) {

            //}

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
        };//this.draw = function()

        this.initialize();
        obj.stack.push(this);
    };//obj.Image = function(src, x, y, width, height)
};