import dt from '../neuralnet/data.js';
import Diabetes from '../../data/diabetes.csv';
import nn from '../neuralnet/neuralnet.js';
import GFX from '../GFXjs/GFX.js';
import '../assets/css/style.css';

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
import { max } from 'lodash';
  
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


function drawChart (xData, yData1, yData2, max, canvasId, divId, label1, label2)
{
    let elem = document.getElementById(canvasId);
    elem.parentNode.removeChild(elem);

    let div = document.getElementById(divId);
    let canvas = document.createElement('canvas');
    canvas.id = canvasId;
    div.appendChild(canvas);

    let ctx = document.getElementById(canvasId);
    
    let myChart = new Chart(ctx, {
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


function renderNeuralNetwork (g, nn1) // GFX object, NeuralNetwork object
{
    g.clear();

    // Graphics datastructure
    let layers = [];
    
    // Graphics parameters
    let numlanes = nn1.nlayers;
    let lanewidth = g.width / numlanes;
    let vpadding = 40;
    let yi = vpadding, yf = g.height - vpadding;
    let uheight = yf - yi;
    let inputvportion = 0.4;
    let inputwportion = 0.2;
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

    console.log('xvalues:', xvalues);

    //===================================================================================
    // +--------------------------------+
    // | DEVELOPMENT                    |
    // | Drawing lanes and middle lines |
    // +--------------------------------+
    //===================================================================================
    if (true) {
        let lanes = [];
        for (let i = 0; i < numlanes; i++) {
            lanes.push(new g.Rectangle(i*lanewidth,0, lanewidth-1,g.height-1));
            lanes[i].color(255, 0, 0);
        }

        let lines = [];
        for (let i = 0; i < numlanes; i++) {
            lines.push(new g.Line(xvalues[i],vpadding, xvalues[i],g.height-vpadding));
            lines[i].color(0, 255, 0);
        }
        
        // Input rectangle
        let halfwidth = lanewidth * 0.5 * inputwportion;
        let x = xvalues[0] - halfwidth;
        let y = vpadding + uheight * (1.0-inputvportion) * 0.5;
        let r = new g.Rectangle(x, y, halfwidth * 2, uheight* inputvportion);
        r.color(0, 0, 255);

        // Hidden layers rectangles
        for (let i = 1; i < nn1.topology.length - 1; i++) {
            console.log('Layer ' + i + ': ' 
                + (nn1.topology[i] * neuronmaxradius * 3 + neuronmaxradius) + ', '
                + (uheight)
            );
            let xhid = xvalues[i] - halfwidth;
            let yhid = vpadding ;
            let rhid = new g.Rectangle(xhid, yhid, halfwidth * 2, uheight);
            rhid.color(0, 0, 255);
        }
    }
    //===================================================================================

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
        curry += inputheight * 0.5;
    }

    // Rendering hidden layers
    let maxnumneurons = Math.max(...nn1.topology);
    if (maxnumneurons * neuronmaxradius * 3 + neuronmaxradius > uheight)
        neuronmaxradius = uheight / (3 * maxnumneurons + 1);
    for (let i = 1; i < nn1.topology.length - 1; i++) {
        layers.push({
            neurons: [],
            synapses: []
        });
        let numneurons = nn1.topology[i];
        let hx = xvalues[i];
        let hy = vpadding + neuronmaxradius * 2;
        if (numneurons * neuronmaxradius * 3 + neuronmaxradius >= uheight) {
            uheighthid = numneurons * neuronmaxradius * 3 + neuronmaxradius;
        }
        hy += 0.5 * (uheight - (numneurons * neuronmaxradius * 3 + neuronmaxradius));
        // First draw synapses
        for (let j = 0; j < nn1.topology[j]; j++) {
            // let p1;
            // if (j == 0)
        }
        // And then draw the neurons
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
            
            hy += neuronmaxradius * 3;
        }
    }

    // Rendering output layer
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

    g.render();
}


let update_net_lines = function(lines, nn1)
{

}


export default function test2 () 
{
    //-------------------------------------------------------------------------
    // GFX environment
    //-------------------------------------------------------------------------
    // Create environment
    let g1 = new GFX('neuralnetcanvas');
    let g2 = new GFX('infocanvas');

    // Info data
    var str1, str2, str3;
    g2.font = "18px Arial"
    str1 = new g2.Text("Iteration: " + (0) + ".", 20, 40);
    str3 = new g2.Text("Epoch: " + (0) + ".", 20, 80);
    str2 = new g2.Text("Batch cost (SMA50): " + (0.0) + ".", 20, 120);

    g1.render();
    g2.render();
    //-------------------------------------------------------------------------

    console.log("Getting data...");
    let dataset = dt.dat_get_diabetes_dataset(Diabetes);
    let dataset_clone = dt.dat_clone_dataset(dataset);
    dt.dat_preprocess(dataset_clone);
    dt.dat_normalize(dataset_clone);
    dt.dat_shuffle(dataset_clone);
    let splitted = dt.dat_split_train_test(dataset_clone);
    let train_data = splitted.train;
    let test_data = splitted.test;
    train_data.batch_size = 32;

    let nn1 = new nn.NeuralNetwork([8, 8, 8, 8, 1]);
    console.log(nn1);
    let iterations = 30000;

    renderNeuralNetwork(g1, nn1);

    // Animation timer
    let xData  = [];
    let yData1 = [];
    let yData2 = [];
    let yData3 = [];
    let yData4 = [];
    let it = 0;
    let animation = setInterval(function(){
        if (it < iterations) 
        {
            // Backprop one minibatch
            nn.nn_backpropagation_sgd (nn1, train_data, 1);

            // Update net lines
            g1.updateScreen();

            // Update info 
            str1.text("Iteration: " + train_data.current_iteration);
            str3.text("Epoch: " + train_data.current_epoch);
            if (yData3.length > 0 && yData4.length > 0)
                str2.text("train: " + yData3[yData3.length-1].toFixed(3) 
                    + '       test: ' + yData4[yData4.length-1].toFixed(3)
                );
            g2.updateScreen();

            // Draw charts 
            if (it % 50 == 0) {
                xData.push(it+1);
                yData1.push(train_data.last_batch_cost);
                let sma50 = 0.0;
                for (let k = 1; k <= Math.min(50, yData1.length); k++)
                    sma50 += yData1[yData1.length-k];
                sma50 /= Math.min(50, yData1.length);
                yData2.push(sma50);
                drawChart(xData, yData1, yData2, train_data.batch_size * 0.5, 
                    'costcanvas', 'cost', 'Batch cost (%50)', 'SMA50'
                );

                let output_train = nn.nn_feed_forward(nn1, train_data.X);
                let accuracy_train = dt.dat_accuracy(train_data, output_train)
                let output_test = nn.nn_feed_forward(nn1, test_data.X);
                let accuracy_test = dt.dat_accuracy(test_data, output_test)
                yData3.push(accuracy_train);
                yData4.push(accuracy_test);
                drawChart(xData, yData3, yData4, 1.0, 
                    'accuracycanvas', 'accuracy', 'Accuracy (train)', 'Accuracy (test)'
                );
            }

            it += 1;
        }
        else // Callback for the end of the animation
        {
            console.log(nn1);
            let output = nn.nn_feed_forward(nn1, test_data.X);
            console.log('accuracy:', dt.dat_accuracy(test_data, output));

            clearInterval(animation);
        }
    }, 1);
};