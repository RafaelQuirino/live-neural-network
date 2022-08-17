import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
} from 'chart.js';
  
Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
);

import la from './neuralnet/linalg.js';


const SYNAPSE_SIZE_FACTOR = 5.0;


function drawChart (xData, yData1, yData2, max, canvasId, divId, label1, label2)
{
    let elem = document.getElementById(canvasId);
    elem.parentNode.removeChild(elem);

    let div = document.getElementById(divId);
    let canvas = document.createElement('canvas');
    canvas.id = canvasId;
    div.appendChild(canvas);

    let ctx = document.getElementById(canvasId);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: xData,
            datasets: [
                {
                    label: label1,
                    data: yData1,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderWidth: 1
                },
                {
                    label: label2,
                    // fill: true,
                    data: yData2,
                    backgroundColor: [
                        'rgba(132, 99, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(132, 99, 255, 1)'
                    ],
                    borderWidth: 2
                }
            ]
        },
        options: {
            pointRadius: 0,
            elements: { point: { radius: 0 } },
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: max,
                    ticks: { 
                        // color: 'white', 
                        beginAtZero: true 
                    }
                },
                x: {
                    display: false
                }
            },
            // Disable animations
            animation: { duration: 0 },
            hover: { animationDuration: 0 },
            responsiveAnimationDuration: 0, // animation duration after a resize
        }
    });
}


function renderNeuralNetwork (g, nn1, features_names) // GFX object, NeuralNetwork object
{
    g.clear();

    // Graphics datastructure
    let layers = [];
    
    // Graphics parameters
    let numlanes = nn1.nlayers;
    let lanewidth = g.width / numlanes;
    let vpadding = 20;
    let yi = vpadding, yf = g.height - vpadding;
    let uheight = yf - yi;
    let inputvportion = 0.5;
    let inputwportion = 0.25;
    let neuronmaxradius = 16;
    
    // Lanes middle points (x values)
    let xvalues = [];
    let currx = 0;
    for (let i = 0; i < numlanes; i++) {
        if (i === 0) 
            currx += lanewidth * 0.5;
        else
            currx += lanewidth;
        xvalues.push(currx);
    }

    function createInputRect (gfx, x, y, width, height) {
        let rect = new gfx.Polygon(
            x, y, 
            x + width, y, 
            x + width, y + height, 
            x, y + height,
        );
        rect.style(gfx.FILL);
        rect.renderBorder(true);
        rect.borderColor(0, 0, 0);
        rect.color(255, 255, 255);
        rect.borderThickness(2);

        return rect
    }

    // Rendering input layer
    let numinputs = nn1.topology[0];
    let inputheight = (uheight * inputvportion) / numinputs;
    let hw = lanewidth * 0.5 * inputwportion;
    let yrect = vpadding + uheight * (1.0 - inputvportion) * 0.5;
    let inputs = [];
    let curry = yrect;
    for (let i = 0; i < nn1.topology[0]; i++) {
        if (i === 0)
            curry += inputheight * 0.25;
        else
            curry += inputheight * 0.5;
        let side = Math.min(hw * 2, inputheight * 0.5);
        inputs.push({
            center: {
                x: xvalues[0],
                y: curry + side * 0.5
            },
            rect: createInputRect(
                g,
                xvalues[0] - side * 0.5,
                curry,
                side,
                side
            )
        });

        g.font = "10px Arial";
        let t = new g.Text(features_names[i], (xvalues[0] - side * 0.5) - 40, curry - 2);
        t.bringToTop();

        curry += inputheight * 0.5;
    }

    // Rendering hidden layers
    let maxnumneurons = Math.max(...nn1.topology);
    if (maxnumneurons * neuronmaxradius * 3 + neuronmaxradius > uheight)
        neuronmaxradius = uheight / (3 * maxnumneurons + 1);
    let last_neurons = [];
    for (let i = 0; i < inputs.length; i++) {
        last_neurons.push({
            x: inputs[i].center.x,
            y: inputs[i].center.y,
            shape: inputs[i].rect
        });
    }

    for (let i = 1; i < nn1.topology.length - 1; i++) {
        layers.push({
            neurons: [],
            synapses: []
        });

        let numneurons = nn1.topology[i];
        let hx = xvalues[i];
        let hy = vpadding + neuronmaxradius * 2;
        let uheighthid = uheight;
        if (numneurons * neuronmaxradius * 3 + neuronmaxradius >= uheight) {
            uheighthid = numneurons * neuronmaxradius * 3 + neuronmaxradius;
        }
        hy += 0.5 * (uheight - (numneurons * neuronmaxradius * 3 + neuronmaxradius));
        
        // First draw synapses
        for (let j = 0; j < last_neurons.length; j++) {
            let hysyn = hy;
            for (let k = 0; k < numneurons; k++) {
                let line = new g.Line (
                    last_neurons[j].x, 
                    last_neurons[j].y,
                    hx,
                    hysyn
                );
                let weight = la.vec_get(nn1.W[i-1], j, k);
				if (weight >= 0) {
					line.color(26,148,49);
					line.alpha(0.7);
				}
				else if (weight < 0) 	{
					line.color(231,76,60);
					line.alpha(0.7);
				}
				line.thickness(Math.log10(Math.abs(weight) * SYNAPSE_SIZE_FACTOR));

                layers[layers.length-1].synapses.push(line);
                
                hysyn += neuronmaxradius * 3;
            }
        }

        // And make each last neuron to bringToTop()
        for (let j = 0; j < last_neurons.length; j++) {
            last_neurons[j].shape.bringToTop();
        }

        // And then draw the neurons
        last_neurons = [];
        for (let j = 0; j < numneurons; j++) {
            let hidneuron = new g.Circle(
                hx, 
                hy, 
                neuronmaxradius
            );
            hidneuron.style(g.FILL);
            hidneuron.color(0, 0, 255);
            hidneuron.renderBorder(true);
            hidneuron.borderColor(0, 0, 0);
            hidneuron.borderThickness(1);
            
            last_neurons.push({
                x: hx,
                y: hy,
                shape: hidneuron
            });

            layers[layers.length-1].neurons.push(hidneuron);
            
            hy += neuronmaxradius * 3;
        }
    }

    // Rendering output layer
    layers.push({
        neurons: [],
        synapses: []
    });

    // Output synapses
    for (let j = 0; j < last_neurons.length; j++) {
        let line = new g.Line (
            last_neurons[j].x, 
            last_neurons[j].y,
            xvalues[xvalues.length - 1], 
            yi + uheight * 0.5,
        );
        let weight = la.vec_get(nn1.W[nn1.topology.length-2], j, 0);
        if (weight >= 0) {
            line.color(26,148,49);
            line.alpha(0.7);
        }
        else if (weight < 0) 	{
            line.color(231,76,60);
            line.alpha(0.7);
        }
        line.thickness(Math.log10(Math.abs(weight) * SYNAPSE_SIZE_FACTOR));

        layers[layers.length-1].synapses.push(line);
    }

    // And make each last neuron to bringToTop()
    for (let j = 0; j < last_neurons.length; j++) {
        last_neurons[j].shape.bringToTop();
    }

    // Output neurons
    let outputneuron = new g.Circle(
        xvalues[xvalues.length - 1], 
        yi + uheight * 0.5, 
        neuronmaxradius
    );
    outputneuron.style(g.FILL);
    outputneuron.color(0, 0, 255);
    outputneuron.renderBorder(true);
    outputneuron.borderColor(0, 0, 0);
    outputneuron.borderThickness(1);

    layers[layers.length-1].neurons.push(outputneuron);

    g.render();

    return layers;
}


let update_net_lines = function(layers, nn1)
{
    for (let k = 0; k < layers.length; k++) {
        let numlastneurons = k === 0 ? 8 : layers[k-1].neurons.length;
        let numneurons = layers[k].neurons.length;
        let currsynapse = 0;
        for (let i = 0; i < numlastneurons; i++) {
            for (let j = 0; j < numneurons; j++) {
                let line = layers[k].synapses[currsynapse++];
                let weight = la.vec_get(nn1.W[k], i, j);
                if (weight >= 0) {
					line.color(26,148,49);
					line.alpha(0.7);
				}
				else if (weight < 0) 	{
					line.color(231,76,60);
					line.alpha(0.7);
				}
				line.thickness(Math.log10(Math.abs(weight) * SYNAPSE_SIZE_FACTOR));
            }
        }
    }
}


export default {
    drawChart: drawChart,
    renderNeuralNetwork: renderNeuralNetwork,
    update_net_lines: update_net_lines
};