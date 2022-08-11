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


function drawChart (xData, yData1, yData2, max)
{
    let elem = document.getElementById("myChart");
    elem.parentNode.removeChild(elem);

    let div = document.getElementById('chartjsDiv');
    let canvas = document.createElement('canvas');
    canvas.id = "myChart";
    canvas.classList.add('myChart');
    div.appendChild(canvas);

    let ctx = document.getElementById('myChart');
    
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xData,
            datasets: [
                {
                    label: 'Batch cost (%25)',
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
                    label: 'SMA50',
                    fill: true,
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
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                y: {
                    min: 0,
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


export default function test2 () 
{
    //-------------------------------------------------------------------------
    // GFX environment
    //-------------------------------------------------------------------------
    // Create environment
    var g1 = new GFX('mycanvas1');
    var g2 = new GFX('mycanvas2');

    // Info data
    var str1, str2, str3;
    g2.font = "22px Arial"
    str1 = new g2.Text("Iteration: " + (0) + ".", 20, 40);
    str3 = new g2.Text("Epoch: " + (0) + ".", 20, 80);
    str2 = new g2.Text("Batch cost (SMA50): " + (0.0) + ".", 20, 120);

    g1.dragAndDrop(true);
    g2.dragAndDrop(true);

    var poly1 = new g1.Polygon(500,180, 650,260, 650,360, 600,290, 500,360);
    poly1.style(g1.FILL);
    poly1.color(0,255,255);
    poly1.renderBorder(true);
    // poly1.renderBoundingBox(true);
    poly1.renderCenter(true);
    poly1.alpha(0.3);

    var poly2 = new g1.Polygon(500,180, 650,260, 650,360, 600,290, 500,360);
    poly2.style(g1.FILL);
    poly2.color(0,255,255);
    poly2.renderBorder(true);
    // poly2.renderBoundingBox(true);
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
    //-------------------------------------------------------------------------

    let chartjs_ctx = document.getElementById('myChart').getContext('2d');

    console.log("Getting data...");
    let dataset = dt.dat_get_diabetes_dataset(Diabetes);
    dataset.batch_size = 54;
    let normalized_dataset = dt.dat_clone_dataset(dataset);
    dt.dat_normalize(normalized_dataset);

    console.log('dataset:', dataset);
    console.log('normalized_dataset:', normalized_dataset);
    console.log("Number of samples:", dataset.size);
    console.log("dataset memory: " + dt.dat_get_mem(dataset)/(1024.0*1024.0) + " MB");

    dt.dat_shuffle(normalized_dataset);

    let nn1 = new nn.NeuralNetwork([8, 32, 32, 32, 1]);
    let iterations = 50000;

    // Animation timer
    let xData  = [];
    // for (let k = 0; k < iterations/25; k++)
    //     xData.push(k);
    let yData1 = [];
    let yData2 = [];
    let it = 0;
    let animation = setInterval(function(){
        if (it < iterations) // Set animation frame
        {
            //	+----------------------+
            //	| ANIMATION FRAME CODE |
            //	+----------------------+
            //==============================================================
            nn.nn_backpropagation_sgd (
                nn1, 
                normalized_dataset,
                1
            );

            //Update net lines --------------------------------------------
            g1.updateScreen();
            //--------------------------------------------------------------

            // Update info -------------------------------------------------
            let cost_mean = 
                normalized_dataset.cost_sum / normalized_dataset.current_iteration;
            str1.text("Iteration: " + normalized_dataset.current_iteration );
            str3.text("Epoch: " + normalized_dataset.current_epoch);
            str2.text("Cost mean: " + cost_mean.toFixed(6));
            g2.updateScreen();
            //--------------------------------------------------------------

            // Draw chart --------------------------------------------------
            if (it % 25 == 0) {
                xData.push(it+1);
                yData1.push(normalized_dataset.last_batch_cost);
                let sma50 = 0.0;
                for (let k = 1; k <= Math.min(50, yData1.length); k++)
                    sma50 += yData1[yData1.length-k];
                sma50 /= Math.min(50, yData1.length);
                yData2.push(sma50);
                drawChart(xData, yData1, yData2, iterations);
            }
            //--------------------------------------------------------------
            //==============================================================

            it += 1;
        } // if (it < iterations)
        else // Callback for the end of the animation
        {
            // Callback here
            //--------------------------------------------------------------
            str3.text("Final cost: " + normalized_dataset.last_batch_cost.toFixed(6) + ".");
            g2.updateScreen();

            //-------------------------------------------
            // TESTING
            //-------------------------------------------
            if (true) {
                // ...
            }// if (true) { (TESTING)
            //--------------------------------------------------------------

            clearInterval(animation);
        }
    }, 1);
};