import graphics from './graphics.js';
import dt from './neuralnet/data.js';
import nn from './neuralnet/neuralnet.js';


let Animation = function(
    iterations,
    nn1,
    train_data,
    test_data,
    gfx_objects
) {
    this.xData  = [];
    this.yData1 = [];
    this.yData2 = [];
    this.yData3 = [];
    this.yData4 = [];
    this.it = 0;
    this.interval = null;
    
    this.iterations = iterations;
    this.nn1 = nn1;
    this.train_data = train_data;
    this.test_data = test_data;
    this.gfx_objects = gfx_objects

    let that = this;
    this.frameFunction = function() {
        let g1 = that.gfx_objects.g1;
        let g2 = that.gfx_objects.g2;
        let str1 = that.gfx_objects.str1;
        let str2 = that.gfx_objects.str2;
        let str3 = that.gfx_objects.str3;
        let xData = that.xData;
        let yData1 = that.yData1;
        let yData2 = that.yData2;
        let yData3 = that.yData3;
        let yData4 = that.yData4;

        if (that.it < that.iterations) 
        {
            // Backprop one minibatch
            nn.nn_backpropagation_sgd (nn1, train_data, 1);

            // Update net lines
            graphics.update_net_lines(gfx_objects.layers, nn1);
            g1.updateScreen();

            // Update info 
            str1.text("Epoch: " + train_data.current_epoch);
            str2.text("Iteration: " + train_data.current_iteration);
            if (yData3.length > 0 && yData4.length > 0)
                str3.text("train: " + yData3[yData3.length-1].toFixed(3) 
                    + '    test: ' + yData4[yData4.length-1].toFixed(3)
                );
            g2.updateScreen();

            // Draw charts 
            if (that.it % 8 == 0) {
                xData.push(that.it+1);
                yData1.push(train_data.last_batch_cost);
                let sma50 = 0.0;
                for (let k = 1; k <= Math.min(50, yData1.length); k++)
                    sma50 += yData1[yData1.length-k];
                sma50 /= Math.min(50, yData1.length);
                yData2.push(sma50);
                graphics.drawChart(xData, yData1, yData2, train_data.batch_size * 0.5, 
                    'costcanvas', 'cost', 'Batch error', 'Average'
                );

                let output_train = nn.nn_feed_forward(nn1, train_data.X);
                let accuracy_train = dt.dat_accuracy(train_data, output_train)
                let output_test = nn.nn_feed_forward(nn1, test_data.X);
                let accuracy_test = dt.dat_accuracy(test_data, output_test)
                yData3.push(accuracy_train);
                yData4.push(accuracy_test);
                graphics.drawChart(xData, yData3, yData4, 1.0, 
                    'accuracycanvas', 'accuracy', 'Accuracy (train)', 'Accuracy (test)'
                );
            }

            that.it += 1;
        }
        else // Callback for the end of the animation
        {
            console.log(nn1);
            let output = nn.nn_feed_forward(nn1, test_data.X);
            console.log('accuracy:', dt.dat_accuracy(test_data, output));

            that.stop();
        }
    }
}


Animation.prototype.start = function() {
    this.interval = setInterval(this.frameFunction, 40);
};


Animation.prototype.stop = function() {
    clearInterval(this.interval);
    this.interval = null;
};


export default {
    Animation: Animation
};