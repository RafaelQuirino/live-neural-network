import Diabetes from '../data/diabetes.csv';
import nn from './neuralnet/neuralnet.js';
import dt from './neuralnet/data.js';
import GFX from './GFXjs/GFX.js';
import anim from './animation.js';
import graphics from './graphics.js';


let Animation = anim.Animation;

export default function() {
    //-------------------------------------------------------------------------
    // GFX environment
    //-------------------------------------------------------------------------
    // Create environment
    let g1 = new GFX('neuralnetcanvas');
    let g2 = new GFX('infocanvas');

    // Info data
    let str1, str2, str3;
    g2.font = "18px Arial"
    str1 = new g2.Text("Epoch: " + (0) + ".", 20, 40);
    str2 = new g2.Text("Iteration: " + (0) + ".", 20, 70);
    str3 = new g2.Text("Batch error: " + (0.0) + ".", 20, 100);

    g1.render();
    g2.render();
    //-------------------------------------------------------------------------

    console.log("Getting data...");
    let dataset = dt.dat_get_diabetes_dataset(Diabetes);
    let dataset_clone = dt.dat_clone_dataset(dataset);
    dt.dat_preprocess(dataset_clone);
    dt.dat_normalize_max(dataset_clone);
    dt.dat_shuffle(dataset_clone);
    let splitted = dt.dat_split_train_test(dataset_clone);
    let train_data = splitted.train;
    let test_data = splitted.test;
    train_data.batch_size = 32;
    console.log('train_data:', train_data);

    let nn1 = new nn.NeuralNetwork([8, 32, 32, 32, 32, 32, 32, 32, 32, 1]);
    console.log(nn1);

    let layers = graphics.renderNeuralNetwork(g1, nn1, dataset.features_names);

    let anim = new Animation(
        4000,
        nn1,
        train_data,
        test_data,
        {
            g1: g1,
            g2: g2,
            str1: str1,
            str2: str2,
            str3: str3,
            layers: layers
        }
    );
    anim.start();
}