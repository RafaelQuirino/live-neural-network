import ut from './util.js';
import la from './linalg.js';


let dt_constants = {
    // Defining types of data preprocessing
    DAT_MEAN_SUBTRACTION : "DAT_MEAN_SUBTRACTION",
    DAT_NORMALIZATION    : "DAT_NORMALIZATION",
    DAT_DECORRELATION    : "DAT_DECORRELATION",
    DAT_WHITENING        : "DAT_WHITENING",

    // Numerical values
    NORM_0     : 0.0,
    NORM_1     : 1.0
}


let Dataset = function ()
{
    // Initialize vectors to be NULL
    this.X = null;
    this.Y = null;

    // Some default values
    this.size               = 0;
    this.batch_size         = 128;
    this.row_offset         = 0;
    this.current_batch      = 0;
    this.current_epoch      = 0;
    this.current_iteration  = 0;
    this.repeat_flag        = 1;
    this.reshuffle_flag     = 0;
    this.features_names     = [];
    this.target_name        = '';
    this.cost_sum           = 0.0;
    this.last_batch_cost    = 0.0;
}


let Minibatch = function()
{
    this.X = null;
    this.Y = null;
    let size = 0;
}


let dat_clone_dataset = function(dataset) 
{
    let clone = new Dataset();

    clone.X                  = la.vec_clone(dataset.X);
    clone.Y                  = la.vec_clone(dataset.Y);
    clone.size               = dataset.size;
    clone.batch_size         = dataset.batch_size;
    clone.row_offset         = dataset.row_offset;
    clone.current_batch      = dataset.current_batch;
    clone.current_epoch      = dataset.current_epoch;
    clone.current_iteration  = dataset.current_iteration;
    clone.repeat_flag        = dataset.repeat_flag;
    clone.reshuffle_flag     = dataset.reshuffle_flag;
    clone.features_names     = [...dataset.features_names];
    clone.target_name        = dataset.target_name;
    clone.cost_sum           = dataset.cost_sum;
    clone.last_batch_cost    = dataset.last_batch_cost;

    return clone
}


// let dat_export = function(data, fname) // Dataset, string
// {
//     // TODO
// }


// let dat_import = function (fname) // string; Returns Dataset
// {
//     // TODO
//     return NULL;
// }


let dat_get_mem = function (data) // Dataset
{
    let mem = 8 * 8;
    mem += la.vec_get_mem(data.X);
    mem += la.vec_get_mem(data.Y);

    return mem;
}


let dat_normalize = function (data) // Dataset
{
    let median = la.vec_get_columns_sums(data.X);
    la.vec_mult_scalar(median, 1.0/data.X.m);

    for (let i = 0; i < data.X.m; i++) 
    {
        for (let j = 0; j < data.X.n; j++) 
        {
            let elem = la.vec_get(data.X, i, j);
            let mu   = la.vec_get(median, 0, j);
            elem -= mu;
            la.vec_set(data.X, i, j, elem);
        }
    }

    let xsquared = la.vec_apply_out(data.X, la.vec_square_op);
    let variance = la.vec_get_columns_sums(xsquared);
    la.vec_mult_scalar(variance, 1.0/data.X.m);    

    for (let i = 0; i < data.X.m; i++)
    {
        for (let j = 0; j < data.X.n; j++)
        {
            let elem  = la.vec_get(data.X, i, j);
            let sigma = la.vec_get(variance, 0, j);
            elem /= sigma;
            la.vec_set(data.X, i, j, elem);
        }
    }
}


let dat_normalize_max = function (data) // Dataset
{
    let max = la.vec_get_columns_max(data.X);

    for (let i = 0; i < data.X.m; i++) 
    {
        for (let j = 0; j < data.X.n; j++) 
        {
            let elem = la.vec_get(data.X, i, j);
            la.vec_set(data.X, i, j, elem/la.vec_get(max, 0, j));
        }
    }
}


let dat_add_noise = function (datavec) // Vec2D
{
    for (let i = 0; i < datavec.m; i++) {
        for (let j = 0; j < datavec.n; j++) {
            // 5% chance of adding noise to element
            let randint = ut.ut_rand() % 21;
            let condition = randint <= 1;

            if (condition) {
                let elem  = la.vec_get(datavec,i,j);
                let noise = ut.ut_gaussian_rand();
                noise /= 100;
                noise = Math.abs(elem + noise);
                la.vec_set(datavec, i, j, noise);
            }
        }
    }
}


//-----------------------------------------------------------------------------
// Different types of exporting/importing datasets
//-----------------------------------------------------------------------------
// dataset_t* dat_import_array (
//     vec_type_t** features_arr, vec_type_t** labels_arr,
//     int features_num_rows, int features_num_columns,
//     int labels_num_rows,   int labels_num_columns
// )
// {
//     return NULL;
// }



// void dat_import_features (const char* features_file)
// {

// }


// void dat_import_labels (const char* labels_file)
// {

// }



// void dat_import_features_array (vec_type_t** features_arr, int rows, int columns)
// {

// }



// void dat_import_labels_array (vec_type_t** labels_arr, int rows, int columns)
// {

// }
//-----------------------------------------------------------------------------


let dat_shuffle = function (data) // Dataset
{
    let n = data.X.m;
 
    // Start from the last element and swap one by one. We don't
    // need to run for the first element that's why i > 0
    for (let i = n-1; i > 0; i--)
    {
        // Pick a random index from 0 to i
        let j = ut.ut_rand() % (i+1);
 
        // Swap arr[i] with the element at random index
        // swap(&arr[i], &arr[j]);
        la.vec_swap_rows(data.X, i, j);
        la.vec_swap_rows(data.Y, i, j);
    }
}


// void dat_repeat (dataset_t* data)
// {
//     // TODO
// }


let dat_next_minibatch = function (data) // Dataset; returns Minibatch
{
    let minibatch = new Minibatch();

    minibatch.X = la.vec_clone_portion_circ(
        data.X, data.row_offset, data.batch_size
    );

    minibatch.Y = la.vec_clone_portion_circ(
        data.Y, data.row_offset, data.batch_size
    );

    minibatch.size = data.batch_size;

    data.current_batch     += 1;
    data.current_iteration += 1;
    if ((data.row_offset + data.batch_size) >= data.size)
    {
        data.current_batch = 0;
        data.current_epoch += 1;
        dat_shuffle(data);
    }
    data.row_offset = (data.row_offset + data.batch_size) % data.size;

    return minibatch;
}


let dat_get_diabetes_dataset = function(Diabetes)
{
    let m = Diabetes.length, 
        n = Diabetes[0].length;
    let dataset = new Dataset();
    dataset.X = new la.Vec2D(m-1, n-1);
    dataset.Y = new la.Vec2D(m-1, 1);
    dataset.size = m-1;

    for (let k = 0; k < n-1; k++)
        dataset.features_names.push(Diabetes[0][k]);
    dataset.target_name = Diabetes[0][n-1]
    for (let i = 1; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (j < n-1) la.vec_set(dataset.X, i-1, j, parseFloat(Diabetes[i][j]));
            else         la.vec_set(dataset.Y, i-1, 0, parseFloat(Diabetes[i][n-1]));
        }
    }

    return dataset;
}


export default {
    dt_constants: dt_constants,
    Dataset: Dataset,
    Minibatch: Minibatch,
    dat_clone_dataset: dat_clone_dataset,
    dat_get_mem: dat_get_mem,
    dat_normalize: dat_normalize,
    dat_normalize_max: dat_normalize_max,
    dat_add_noise: dat_add_noise,
    dat_shuffle: dat_shuffle,
    dat_next_minibatch: dat_next_minibatch,
    dat_get_diabetes_dataset: dat_get_diabetes_dataset
};