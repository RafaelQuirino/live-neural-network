import GFX from '../GFXjs/GFX.js';

export default function test1 () {
    // Create environment
    var g1 = new GFX('mycanvas1');
    var g2 = new GFX('mycanvas2');

    // Info data
    var str1, str2, str3;
    g2.font = "24px Arial"
    str1 = new g2.Text("Epoch: " + (0) + ".", 20, 50);
    str2 = new g2.Text("Cost: " + (0.0) + ".", 20, 100);
    str3 = new g2.Text("", 20, 150);

    g1.dragAndDrop(true);
    g2.dragAndDrop(true);
    
    // var r = new g2.Rectangle(20, 20, 100, 100);
    // r.color(255,0,0);

    var rect2 = new g1.Rectangle(300,100, 100, 100);
    rect2.style(g1.DASHED);

    var poly1 = new g1.Polygon(500,180, 650,260, 650,360, 600,290, 500,360);
    poly1.style(g1.FILL);
    poly1.color(0,255,255);
    poly1.renderBorder(true);
    poly1.renderBoundingBox(true);
    poly1.renderCenter(true);
    poly1.alpha(0.3);

    var poly2 = new g1.Polygon(500,180, 650,260, 650,360, 600,290, 500,360);
    poly2.style(g1.FILL);
    poly2.color(0,255,255);
    poly2.renderBorder(true);
    poly2.renderBoundingBox(true);
    poly2.renderCenter(true);
    poly2.alpha(0.3);

    g1.render();
    g2.render();

    var i = 1;
    var anim1 = setInterval(function(){
        i++;
        if (poly2._inclination <= 90) {
            var inc = poly2.inclination();
            poly2.inclination(inc + 1);
            g1.updateScreen();
        }
        if (i >= 90) {
            clearInterval(anim1);
        }
    }, 50);
};