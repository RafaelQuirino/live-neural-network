import ut from './util.js';
import la from './linalg.js';
import dt from './data.js';


let nn_constants = 
{
    // Defining types weight initialization
    NN_WINIT_RANDOM                :'NN_WINIT_RANDOM',
    NN_WINIT_GAUSSIAN              :'NN_WINIT_GAUSSIAN',
    NN_WINIT_VARIANCE_CALLIBRATION :'NN_WINIT_VARIANCE_CALLIBRATION',
    NN_BINIT_ONE                   :'NN_BINIT_ONE',
    NN_BINIT_ZERO                  :'NN_BINIT_ZERO',
    NN_BINIT_SMALL                 :'NN_BINIT_SMALL',
    NN_BINIT_RANDOM                :'NN_BINIT_RANDOM',
    NN_BINIT_GAUSSIAN              :'NN_BINIT_GAUSSIAN',

    // Defining types of loss and cost functions
    NN_HINGE_LOSS                :'NN_HINGE_LOSS',
    NN_SQUARE_ERROR              :'NN_SQUARE_ERROR',
    NN_CROSS_ENTROPY             :'NN_CROSS_ENTROPY',
    NN_MEAN_SQUARE_ERROR         :'NN_MEAN_SQUARE_ERROR',
    NN_HALF_SQUARE_ERROR         :'NN_HALF_SQUARE_ERROR',
    NN_LOGISTIC_REGRESSION       :'NN_LOGISTIC_REGRESSION',
    NN_BINARY_CROSS_ENTROPY      :'NN_BINARY_CROSS_ENTROPY',
    NN_HALF_MEAN_SQUARE_ERROR    :'NN_HALF_MEAN_SQUARE_ERROR',
    NN_NEGATIVE_LOG_LIKELIHOOD   :'NN_NEGATIVE_LOG_LIKELIHOOD',
    NN_CATEGORICAL_CROSS_ENTROPY :'NN_CATEGORICAL_CROSS_ENTROPY',

    // Defining types of activation functions
    NN_IDENTITY_ACTIVATION           :'NN_IDENTITY_ACTIVATION',
    NN_RELU_ACTIVATION               :'NN_RELU_ACTIVATION',
    NN_SIGMOID_ACTIVATION            :'NN_SIGMOID_ACTIVATION',
    NN_SOFTMAX_ACTIVATION            :'NN_SOFTMAX_ACTIVATION',
    NN_HYPERBOLIC_TANGENT_ACTIVATION :'NN_HYPERBOLIC_TANGENT_ACTIVATION',

    // Defining types of regularization
    NN_NO_REGULARIZATION        :'NN_NO_REGULARIZATION',
    NN_L1_REGULARIZATION        :'NN_L1_REGULARIZATION',
    NN_L2_REGULARIZATION        :'NN_L2_REGULARIZATION',
    NN_DROPOUT_REGULARIZATION   :'NN_DROPOUT_REGULARIZATION',
    NN_FROBENIUS_REGULARIZATION :'NN_FROBENIUS_REGULARIZATION',

    // Defining types of optimization
    NN_NO_OPTIMIZATION       :'NN_NO_OPTIMIZATION',
    NN_MOMENTUM_OPTIMIZATION :'NN_MOMENTUM_OPTIMIZATION',
    NN_RMS_OPTIMIZATION      :'NN_RMS_OPTIMIZATION',
    NN_ADAM_OPTIMIZATION     :'NN_ADAM_OPTIMIZATION',

    // Defining common values
    NN_EPSILON : 1e-9,
}


let NeuralNetwork = function (topology)
{
    let tsize = topology.length;

	// Building topology...
	this.topology = Array(tsize);
	for (let i = 0; i < tsize; i++)
		this.topology[i] = topology[i];
	this.nlayers = tsize;

	// Building weight matrices and bias vectors
    this.W = Array(tsize-1);
    this.B = Array(tsize-1);
	nn_initialize_weights(this);
	for (let i = 0; i < tsize-1; i++) {
		this.B[i] = new la.Vec2D(1, topology[i+1]);
		la.vec_set_all_func(this.B[i], ut.ut_gaussian_rand);
	}

	// Building activity (Z) and activation (A) matrices...
    this.Z = Array(tsize-1);
    this.A = Array(tsize-1);
	for (let i = 0; i < tsize-1; i++) {
		this.Z[i] = null;
		this.A[i] = null;		
	}

	// Building "velocities" for momentum learning
    this.VdW = Array(tsize-1);
	this.VdB = Array(tsize-1);
	for (let i = 0; i < tsize-1; i++) {
		this.VdW[i] = new la.Vec2D(topology[i], topology[i+1]);
		la.vec_set_all(this.VdW[i], 0.0);
		this.VdB[i] = new la.Vec2D(1, topology[i+1]);
		la.vec_set_all(this.VdB[i], 0);
	}

	// Building "sums" for RMS and ADAM learning
    this.SdW = Array(tsize-1);
    this.SdB = Array(tsize-1);
	for (let i = 0; i < tsize-1; i++) {
		this.SdW[i] = new la.Vec2D(topology[i],topology[i+1]);
		la.vec_set_all(this.SdW[i], 0);
		this.SdB[i] = new la.Vec2D(1, topology[i+1]);
		la.vec_set_all(this.SdB[i], 0);
	}

	// Initializing net's output
	this.yHat = null;

	// Creating activation functions
    this.activations = Array(tsize-1);
	for (let i = 0; i < (tsize-1); i++) {
		this.activations[i] = nn_constants.NN_RELU_ACTIVATION;
	}

	// Configurations
	//================
	this.cost_function     = nn_constants.NN_SQUARE_ERROR;
	this.output_activation = nn_constants.NN_SIGMOID_ACTIVATION;
	this.regularization    = nn_constants.NN_L2_REGULARIZATION;
	this.optimization      = nn_constants.NN_ADAM_OPTIMIZATION;
	
	this.rms_rate            = 0.9;
	this.momentum_rate       = 0.9;
	this.learning_rate       = 0.001;
	this.regularization_rate = 0.0001;

	// Setting output layer's activation
	//===================================
	this.activations[(tsize-1)-1] = this.output_activation;
}


let nn_initialize_weights = function (nn) // A NeuralNetwork object
{
	for (let k = 0; k < nn.nlayers-1; k++) {
		nn.W[k] = new la.Vec2D(nn.topology[k],nn.topology[k+1]);

		for (let i = 0; i < nn.W[k].m; i++) {
			for (let j = 0; j < nn.W[k].n; j++) {
				let val = ut.ut_gaussian_rand();
				let init_term = Math.sqrt(1.0/nn.topology[k]);
				val *= init_term;
				la.vec_set(nn.W[k], i, j, val);
			}
		}
	}
}


let nn_set_cost_function = function (nn, cost_func_code)
{
	let func = cost_func_code;
	nn.cost_function = cost_func_code;
}


let nn_set_layer_activation = function (nn, layeridx, act_func_code)
{
    let line = new Error().lineNumber + 1;
    if (layeridx < 0 || layeridx >= nn.nlayers-1) {
		ut_errmsg (
			"Invalid layer index.",
			"neuralnet.js", line, 1
		);
	}

	nn.activations[layeridx] = act_func_code;
}


let nn_set_layers_activation = function (nn, act_func_code)
{
	for (let i = 0; i < nn.nlayers-1; i++) {
		nn_set_layer_activation(nn, i, act_func_code);
	}
}


let nn_set_output_activation = function (nn, act_func_code)
{
	let tsize = nn.nlayers;
	nn.output_activation = act_func_code;
	nn.activations[(tsize-1)-1] = nn.output_activation;
}


// Run the network, saving all activities (Z) and activation (A) matrices
// for the backpropagation to work.
let nn_forward = function (nn, data) // NeuralNetwork, Vec2D; returns a Vec2D
{
	let line = new Error().lineNumber + 1;
	if (data.n != nn.W[0].m) {
		ut_errmsg (
			"let data is not in the right format ("+data.m+"x"+nn.W[0].m+").",
			"neuralnet.js", line, 1
		);
	}

	// First, free all previous Z[i] and A[i] memory
	for (let i = 0; i < nn.nlayers-1; i++) {
		nn.Z[i] = null;
		nn.A[i] = null;
	}

	// Then, initialize the current layer input
	// to be the data (input for first layer)
	let layerInput = data;

	//------------------------------------------------
	// Now, for each layer but the first...
	// (input layer is not really a layer)
	// Obs.: Z[0] represent activities in layer 1...
	//------------------------------------------------
	for (let i = 0; i < nn.nlayers-1; i++) {	
		//-------------------------------------
		// Calculate Z[i] and A[i] = f(Z[i])
		//-------------------------------------

		// First, Z[i] = layerInput * nn.W[i]
		nn.Z[i] = la.vec_get_dot(layerInput, nn.W[i]);
		
		// Then add bias, Z[i][row] = Z[i][row] + B[i], for each row
		for (let row = 0; row < nn.Z[i].m; row++)
			la.vec_sum_row(nn.Z[i], row, nn.B[i].vec);

		// Last, make A[i] = f(Z[i]),
		// where f is the activation function
		nn.A[i] = nn_apply_activation(nn, i);

		// Update the layer input to be
		// the activation of the previous layer
		layerInput = nn.A[i];
	}

	// Return a clone to the last 
	// activation layer matrix (the output)
	let result_vec = la.vec_clone(nn.A[nn.nlayers-2]);

	return result_vec;
}


// Do not save activities (Z) and activations (A)
// (Just to get neural_net's output, not running backpropagation)
let nn_feed_forward = function (nn, data) // NeuralNetwork, Vec2D; returns a Vec2D
{
	let line = new Error().lineNumber + 1;
	if (data.n != nn.W[0].m) {
		ut_errmsg (
			"let data is not in the right format (nx"+nn.topology[0]+").",
			"neuralnet.js", line, 1
		);
	}

	// First, free all previous Z[i]
	for (let i = 0; i < nn.nlayers-1; i++)
		nn.Z[i] = null;

	// Then, initialize the current layer input
	// to be the data (input for first layer)
	let layerInput = data;

	//-----------------------------------------------------
	// Now, for each layer but the first...
	// (input layer is not really a layer).
	// We're going to use nn.Z[i] as an auxiliar
	// memoty to run the data through the neural net.
	//-----------------------------------------------------
	for (let i = 0; i < nn.nlayers-1; i++) {
		// First, Z[i] = layerInput * nn.W[i]
		nn.Z[i] = la.vec_get_dot(layerInput, nn.W[i]);
		
		// Then add bias, Z[i][row] = Z[i][row] + B[i], for each row
		for (let row = 0; row < nn.Z[i].m; row++)
			la.vec_sum_row(nn.Z[i], row, nn.B[i].vec);

		// Last, make Z[i] = f(Z[i]),
		// where f is the activation function
		nn.Z[i] = nn_apply_activation(nn, i);

		// Update the layer input to be
		// the activation of the previous layer
		layerInput = nn.Z[i];

		// Freeing last layer's memory
		if (i > 0) {
			nn.Z[i-1] = null;
		}
	}

	// Return a clone to the last 
	// activation layer matrix (the output)
	let result_vec = la.vec_clone(nn.Z[nn.nlayers-2]);
	nn.Z[nn.nlayers-2] = null;

	return result_vec;
}


let nn_cost_func = function (
	nn, y, yHat, funcflag
) // NeuralNetwork, Vec2D, Vec2D, int; returns a double
{
	let cost = 0.0;

	if (funcflag == nn_constants.NN_SQUARE_ERROR) 
    {
		let y_yHat = la.vec_get_diff(y, yHat);
		la.vec_apply(y_yHat, la.vec_square_op);
		cost = (1.0) * la.vec_inner_sum(y_yHat);
		y_yHat = null;
	}
	else if (funcflag == nn_constants.NN_HALF_SQUARE_ERROR)
    {
		let y_yHat = la.vec_get_diff(y, yHat);
		la.vec_apply(y_yHat, la.vec_square_op);
		cost = (1.0/2.0) * la.vec_inner_sum(y_yHat);
		y_yHat = null;
	}
	else if (funcflag == nn_constants.NN_MEAN_SQUARE_ERROR)
	{
		let y_yHat = la.vec_get_diff(y, yHat);
		la.vec_apply(y_yHat, la.vec_square_op);
		cost = (1.0/y.m) * la.vec_inner_sum(y_yHat);
		y_yHat = null;
	}
	else if (funcflag == nn_constants.NN_HALF_MEAN_SQUARE_ERROR)
	{
		let y_yHat = la.vec_get_diff(y,yHat);
		la.vec_apply(y_yHat, la.vec_square_op);
		cost = (1.0/(2.0*y.m)) * la.vec_inner_sum(y_yHat);
		y_yHat = null;
	}
	// ***   PROBABLY WRONG   ***
	else if (funcflag == nn_constants.ROSS_ENTROPY)
	{
		// ylnyHat = y * ln(yHat)
		let ylnyHat = la.vec_apply_out(yHat, la.vec_log_op);
		la.vec_mult_elwise(y, ylnyHat, ylnyHat);
		// cost = (-1.0/(la.vec_type_t)y.m) * la.vec_inner_sum(ylnyHat);
		cost = (-1.0) * la.vec_inner_sum(ylnyHat);
		ylnyHat = null;
	}
	// ***   THIS IS WRONG   ***
	// J = -1/n * Sum{y/yHat + (1-y)/(1-yHat)}
	else if (funcflag == nn_constants.NN_BINARY_CROSS_ENTROPY)
	{
		// (1-y)
		let aux1 = la.vec_get_scalar_prod(y, -1);
		la.vec_add_scalar(aux1, 1);
		
		// (1-yHat)
		let aux2 = la.vec_get_scalar_prod(nn.yHat, -1);
		la.vec_add_scalar(aux2,1);

		// aux1 := (1-y)ln(1-yHat)
		la.vec_apply(aux2, la.vec_log_op);
		la.vec_mult_elwise(aux1, aux2, aux1);

		// yln(yHat)
		aux2 = null;
		aux2 = la.vec_apply_out(yHat,la.vec_log_op);
		let ylnyHat = la.vec_get_mult_elwise(y, aux2);

		// Sum of yln(yHat) + (1-y)ln(1-yHat)
		la.vec_add(ylnyHat, aux1, aux1);
		cost = (-1.0/y.m) * la.vec_inner_sum(aux1);
		
		aux1 = null;
		aux2 = null;
		ylnyHat = null;
	}

	cost += nn_regularization_term(nn);
	
	return cost;
}


let nn_cost_func_gradient = function (
    nn, y, yHat, funcflag
) // NeuralNetwork, Vec2D, Vec2D, int; returns a Vec2D
{
	let grads = null;

	if (funcflag == nn_constants.NN_SQUARE_ERROR)
	{
		grads = new la.Vec2D(y.m, y.n);
		la.vec_sub(y, nn.yHat, grads);
		la.vec_mult_scalar(grads, -2);
	}
	else if (funcflag == nn_constants.NN_HALF_SQUARE_ERROR)
	{
		grads = new la.Vec2D(y.m, y.n);
		la.vec_sub(y, nn.yHat, grads);
		la.vec_mult_scalar(grads, -1);
	}
	else if (funcflag == nn_constants.NN_MEAN_SQUARE_ERROR)
	{
		grads = new la.Vec2D(y.m, y.n);
		la.vec_sub(y, nn.yHat, grads);
		la.vec_mult_scalar(grads, -(2/y.m));
	}
	else if (funcflag == nn_constants.NN_HALF_MEAN_SQUARE_ERROR)
	{
		grads = new la.Vec2D(y.m, y.n);
		la.vec_sub(y, nn.yHat, grads);
		la.vec_mult_scalar(grads, -(1/y.m));
	}
	// ***   PROBABLY WRONG   ***
	else if (funcflag == nn_constants.NN_CROSS_ENTROPY)
	{
		grads = la.vec_clone(y);
		la.vec_mult_scalar(grads, -1);
		la.vec_div_elwise(grads, yHat, grads);
	}
	// ***   THIS IS WRONG   ***
	// J = -1/n * Sum{y/yHat + (1-y)/(1-yHat)}
	else if (funcflag == nn_constants.NN_BINARY_CROSS_ENTROPY)
	{
		grads = new la.Vec2D(y.m, y.n);
		la.vec_set_all(grads, 0);

		// aux1 := (1-y)/(1-yHat)
		let aux1 = la.vec_get_scalar_prod(y, -1);
		let aux2 = la.vec_get_scalar_prod(nn.yHat, -1);
		la.vec_add_scalar(aux1, 1);
		la.vec_add_scalar(aux2, 1);
		la.vec_div_elwise(aux1, aux2, aux1);

		// grads := y/yHat
		la.vec_div_elwise(y, nn.yHat, grads);

		// grads := -1/n * {y/yHat + (1-y)/(1-yHat)}
		la.vec_add(grads, aux1, grads);
		la.vec_mult_scalar(grads,-1*(1.0/y.m));

		aux1 = null;
		aux2 = null;
	}

	return grads;
}


let nn_cost_func_prime = function (
	nn, X, Y,
	dJdWs_out, dJdBs_out
) // NeuralNetwork, Vec2D, Vec2D, Vec2D_ref, Vec2D_ref; returns a double
{
	// First of all, forward the data
	// and get the net's output (yHat)
	nn.yHat = null;
	nn.yHat = nn_forward(nn, X);

	//-----------------------------------------------------
	// CALCULATE THE COST FOR OUTPUT
	//-----------------------------------------------------
	let cost = nn_cost_func(
		nn, Y, nn.yHat,
		nn.cost_function
	);
	//-----------------------------------------------------

	//==============================================
	// CALCULATE GRADIENTS FROM LAST TO FIRST LAYER
	//==============================================

	//-----------------
	// Initializations
	//-----------------

	// dJdW outputs
    let dJdWs = Array(nn.nlayers-1);

	// dJdB outputs
    let dJdBs = Array(nn.nlayers-1);

	// First activation matrix (Xt)
	let Xt = la.vec_transposed(X);
	
	// Loop variables
	let act        = null;
	let grads_z    = null;
	let delta      = null;
	let Wt         = null;
	let Waux       = null;
		
	// COST FUNCTION DERIVATIVE ---------------------------
	// let errsign = _y_yHat;
	let errsign = nn_cost_func_gradient(
		nn, Y, nn.yHat,
		nn.cost_function
	);
	//-----------------------------------------------------

	// Backpropagation loop
	for (let i = nn.nlayers-2; i >= 0; i--)  {
		//---------------------------------------------------------------------
		// Prepare matrices 
		//---------------------------------------------------------------------
		grads_z = nn_apply_activation_prime(nn, i);
		
		if (i == 0)
			act = Xt; // First layer's activation is the data itself
		else
			act = la.vec_transposed(nn.A[i-1]);
		//---------------------------------------------------------------------

		//---------------------------------------------------------------------
		// Calculating and saving dJdW and dJdB
		//---------------------------------------------------------------------
		delta = la.vec_get_mult_elwise(errsign, grads_z);
		grads_z = null;
		errsign = null;

		// Weights gradient
		dJdWs[i] = la.vec_get_dot(act, delta);

		// Regularization
		if (nn.regularization == nn_constants.NN_L2_REGULARIZATION) 
        {
			Waux = la.vec_get_scalar_prod(nn.W[i], nn.regularization_rate);
			la.vec_add(dJdWs[i], Waux, dJdWs[i]);
			Waux = null;
		}

		// Bias gradient, reference below...
		// "https://datascience.stackexchange.com/questions/20139/
		//  gradients-for-bias-terms-in-backpropagation/20142#20142"
		dJdBs[i] = la.vec_get_columns_sums(delta);
		
		act = null;
		//---------------------------------------------------------------------

		//---------------------------------------------------------------------
		// Post iteration calculations (errsign for the next iteration)
		//---------------------------------------------------------------------
		Wt = la.vec_transposed(nn.W[i]);
		errsign = la.vec_get_dot(delta,Wt);

		Wt = null;
		delta = null;
		//---------------------------------------------------------------------
		
	} // for (i = nn.nlayers-2; i >= 0; i--)
	
	// Freeing memory
	errsign = null;

	// // Outputting results
	// dJdWs_out = dJdWs;
	// dJdBs_out = dJdBs;

	// return cost;

	return [cost, dJdWs, dJdBs];
}


let nn_backpropagation = function (
	nn, X, Y, 
	num_iterations,
	learning_rate
) // NeuralNetwork, Vec2D, Vec2D, int, double
{
	let dJdW, dJdB;

	// For each iteration of backpropagation
	for (let i = 0; i < num_iterations; i++) 
	{
		// Calculate gradients
		// let cost = nn_cost_func_prime(nn, X, Y, dJdW, dJdB);

		let results = nn_cost_func_prime(nn, X, Y);
		let cost = results[0];
		dJdW = results[1];
		dJdB = results[2];

		if (i % 100 === 0)
			console.log("iteration: "+(i+1)+", cost: "+cost);		

		// For each layer in the neural net
		for (let j = 0; j < nn.nlayers-1; j++)
		{
			nn_optimization(
				nn, dJdW[j], dJdB[j],
				learning_rate, j, i, nn.optimization
			);

			//Freeing memory
			dJdW[j] = null;
			dJdB[j] = null;

		}
	}
}


let nn_backpropagation_sgd = function (
	nn,
	dataset, 
	num_iterations
) // NeuralNetwork, string, Dataset, int
{
	// Variables
	let dJdW, dJdB;
	let costsum  = 0.0;
	let costmean = 0.0;

	// Parameters
	let learning_rate = nn.learning_rate;
	let current_epoch = 0;

	// For each iteration of backpropagation
	for (let i = 0; i < num_iterations; i++) 
	{
		let batch = dt.dat_next_minibatch(dataset);

		// Calculate gradients
		// let cost = nn_cost_func_prime(nn, batch.X, batch.Y, dJdW, dJdB);

		let results = nn_cost_func_prime(nn, batch.X, batch.Y);
		let cost = results[0];
		dJdW = results[1];
		dJdB = results[2];

		// costsum += cost;
		// costmean = costsum / parseFloat(i+1);

		dataset.last_batch_cost = cost;
		dataset.cost_sum += cost;
		costsum = dataset.cost_sum;
		costmean = dataset.cost_sum / (dataset.current_iteration+1);

		// printf(
		// 	"\repoch: %4d, batch: %4d, iteration: %4d, cost: %5g, mean: %5g%s",
		// 	dataset.current_epoch, dataset.current_batch,
		// 	dataset.current_iteration, cost, costmean,
		// 	"     "
		// );
		
		if (dataset.current_iteration % 100 === 0) {
			let s = '';
			s += 'epoch: ' + dataset.current_epoch;
			s += ', batch: ' + dataset.current_batch;
			s += ', iteration: ' + dataset.current_iteration;
			s += ', cost: ' + cost;
			s += ', mean: ' + costmean;
			console.log(s);
		}

		// For each layer in the neural net
		for (let j = 0; j < nn.nlayers-1; j++)
		{
			nn_optimization(
				nn, dJdW[j], dJdB[j],
				learning_rate, j, i, nn.optimization
			);
		} // for (j = 0; j < nn.nlayers-1; j++)

		if (dataset.current_epoch > current_epoch)
		{
			current_epoch = dataset.current_epoch;
			// nn_export(nn,nnfile);
		}
	}
}


let nn_optimization = function (
	nn, dJdW, dJdB,
	learning_rate, layer, iteration,
	optimization_code
)
{
	let line = new Error().lineNumber + 1;
	if (layer < 0 || layer >= nn.nlayers-1) {
		ut.ut_errmsg (
			"Invalid index for layer.",
			"neuralnet.js", line, 1
		);
	}

	if (optimization_code == nn_constants.NN_NO_OPTIMIZATION)
	{
		// Updating weights for current layer
		la.vec_mult_scalar(dJdW, learning_rate);
		la.vec_sub(nn.W[layer], dJdW, nn.W[layer]);

		// Updating biases for current layer
		la.vec_mult_scalar(dJdB, learning_rate);
		la.vec_sub(nn.B[layer], dJdB, nn.B[layer]);
	}
	else if (optimization_code == nn_constants.NN_MOMENTUM_OPTIMIZATION)
	{
		let alphaVdW, alphaVdB;

		// Updating weights and biases for current layer
		//-----------------------------------------------
		// newVdW = beta1*VdW + (1-beta1)*dJdW
		// newVdB = beta1*VdB + (1-beta1)*dJdB
		// newW   = W - alpha*newVdW
		// newB   = B - alpha*newVdB

		la.vec_mult_scalar(nn.VdW[layer], nn.momentum_rate);
		la.vec_mult_scalar(dJdW, 1-nn.momentum_rate);
		la.vec_add(nn.VdW[layer], dJdW, nn.VdW[layer]);
		alphaVdW = la.vec_get_scalar_prod(nn.VdW[layer], learning_rate);
		la.vec_sub(nn.W[layer], alphaVdW, nn.W[layer]);

		la.vec_mult_scalar(nn.VdB[layer], nn.momentum_rate);
		la.vec_mult_scalar(dJdB, 1-nn.momentum_rate);
		la.vec_add(nn.VdB[layer], dJdB, nn.VdB[layer]);
		alphaVdB = la.vec_get_scalar_prod(nn.VdB[layer], learning_rate);
		la.vec_sub(nn.B[layer], alphaVdB, nn.B[layer]);
	}
	else if (optimization_code == nn_constants.NN_RMS_OPTIMIZATION)
	{
		let dJdWsquared, dJdBsquared;
		let newSdW, newSdB; 

		//------------------
		// Updating weights
		// -----------------                      element wise square...
		// newSdW = beta2*SdW + (1-beta2)*(dJdW^2)
		// newW = W - alpha*(dJdW/(sqrt(newSdW)+epsilon))
		la.vec_mult_scalar(nn.SdW[layer], nn.rms_rate);
		dJdWsquared = la.vec_apply_out(dJdW, la.vec_square_op);
		la.vec_mult_scalar(dJdWsquared, 1-nn.rms_rate);
		newSdW = la.vec_get_sum(nn.SdW[layer], dJdWsquared);
		la.vec_copy(nn.SdW[layer], newSdW);
		la.vec_apply(newSdW, la.vec_sqrt_op);
		la.vec_add_scalar(newSdW, nn_constants.NN_EPSILON);
		la.vec_div_elwise(dJdW, newSdW, dJdW);
		la.vec_mult_scalar(dJdW, learning_rate);
		la.vec_sub(nn.W[layer], dJdW, nn.W[layer]);

		//-----------------
		// Updating biases
		// ----------------                       element wise square...
		// newSdB = beta2*SdB + (1-beta2)*(dJdB^2)
		// newB = B - alpha*(dJdB/(sqrt(newSdB)+epsilon))
		la.vec_mult_scalar(nn.SdB[layer], nn.rms_rate);
		dJdBsquared = la.vec_apply_out(dJdB, la.vec_square_op);
		la.vec_mult_scalar(dJdBsquared, 1-nn.rms_rate);
		newSdB = la.vec_get_sum(nn.SdB[layer], dJdBsquared);
		la.vec_copy(nn.SdB[layer], newSdB);
		la.vec_apply(newSdB, la.vec_sqrt_op);
		la.vec_add_scalar(newSdB, nn_constants.NN_EPSILON);
		la.vec_div_elwise(dJdB, newSdB, dJdB);
		la.vec_mult_scalar(dJdB, learning_rate);
		la.vec_sub(nn.B[layer], dJdB, nn.B[layer]);
	}
	else if (optimization_code == nn_constants.NN_ADAM_OPTIMIZATION)
	{
		let dJdWsquared, dJdBsquared;
		let newSdW, newSdB;
		let t = iteration;

		let alpha = learning_rate;
		let beta1 = nn.momentum_rate;
		let beta2 = nn.rms_rate;

		//------------------
		// Updating weights
		// -----------------
		// newVdW = beta1*VdW + (1-beta1)*dJdW
		// newSdW = beta2*SdW + (1-beta2)*(dJdW^2)
		// Bias correction (VdW := VdW/(1-beta1^t)), SdW...
		// W = W - alpha*(VdW/(sqrt(SdW)+epsilon))

		// Calculate dJdW^2 before losing dJdW...
		dJdWsquared = la.vec_apply_out(dJdW, la.vec_square_op);

		la.vec_mult_scalar(nn.VdW[layer], beta1);
		la.vec_mult_scalar(dJdW, 1.0-beta1); // lost dJdW...
		la.vec_add(nn.VdW[layer], dJdW, nn.VdW[layer]);

		la.vec_mult_scalar(nn.SdW[layer], beta2);
		la.vec_mult_scalar(dJdWsquared, 1.0-beta2);
		newSdW = la.vec_get_sum(nn.SdW[layer], dJdWsquared);
		la.vec_copy(nn.SdW[layer], newSdW);

		// NOT WORKING...
		// la.vec_mult_scalar(nn.VdW[layer], (la.vec_type_t) 1.0/(1.0-pow(beta1,t)));
		// la.vec_mult_scalar(nn.SdW[layer], (la.vec_type_t) 1.0/(1.0-pow(beta2,t)));

		// We'll use dJdW as auxiliar matrix
		la.vec_apply(newSdW, la.vec_sqrt_op);
		la.vec_add_scalar(newSdW, nn_constants.NN_EPSILON);
		la.vec_div_elwise(nn.VdW[layer], newSdW, dJdW);
		la.vec_mult_scalar(dJdW, alpha);
		la.vec_sub(nn.W[layer], dJdW, nn.W[layer]);

		//------------------
		// Updating biases
		// -----------------
		// newVdB = beta1*VdB + (1-beta1)*dJdB
		// newSdB = beta2*SdB + (1-beta2)*(dJdB^2)
		// Bias correction (VdB := VdB/(1-beta1^t)), SdB...
		// B = B - alpha*(VdB/(sqrt(SdB)+epsilon))

		dJdBsquared = la.vec_apply_out(dJdB, la.vec_square_op);

		la.vec_mult_scalar(nn.VdB[layer], beta1);
		la.vec_mult_scalar(dJdB, 1.0-beta1);
		la.vec_add(nn.VdB[layer], dJdB, nn.VdB[layer]);

		la.vec_mult_scalar(nn.SdB[layer], beta2);
		dJdBsquared = la.vec_apply_out(dJdB, la.vec_square_op);
		la.vec_mult_scalar(dJdBsquared, 1.0-beta2);
		newSdB = la.vec_get_sum(nn.SdB[layer], dJdBsquared);
		la.vec_copy(nn.SdB[layer], newSdB);

		// NOT WORKING...
		// la.vec_mult_scalar(nn.VdB[layer], (la.vec_type_t) 1.0/(1.0-pow(beta1,t)));
		// la.vec_mult_scalar(nn.SdB[layer], (la.vec_type_t) 1.0/(1.0-pow(beta2,t)));

		// We'll use dJdW as auxiliar matrix
		la.vec_apply(newSdB, la.vec_sqrt_op);
		la.vec_add_scalar(newSdB, nn_constants.NN_EPSILON);
		la.vec_div_elwise(nn.VdB[layer], newSdB, dJdB);
		la.vec_mult_scalar(dJdB, alpha);
		la.vec_sub(nn.B[layer], dJdB, nn.B[layer]);
	}
}


let nn_activation_func = function (k, func, flag)
{
	let result;

	if (flag == nn_constants.NN_IDENTITY_ACTIVATION)
		result = nn_identity(k);

	else if (flag == nn_constants.NN_RELU_ACTIVATION)
		result = nn_relu(k);
	
	else if (flag == nn_constants.NN_SIGMOID_ACTIVATION)
		result = nn_sigmoid(k);
	
	else if (flag == nn_constants.NN_HYPERBOLIC_TANGENT_ACTIVATION)
		result = nn_hyperbolic_tangent(k);

	return result;
}


let nn_activation_func_prime = function (k, func, flag)
{
	let result;

	if (flag == nn_constants.NN_IDENTITY_ACTIVATION)
		result = nn_identity_prime(k);
	
	else if (flag == nn_constants.NN_RELU_ACTIVATION)
		result = nn_relu_prime(k);
	
	else if (flag == nn_constants.NN_SIGMOID_ACTIVATION)
		result = nn_sigmoid_prime(k);
	
	else if (flag == nn_constants.NN_HYPERBOLIC_TANGENT_ACTIVATION)
		result = nn_hyperbolic_tangent_prime(k);

	return result;
}


let nn_get_activation = function (flag)
{
	let activation;

	if (flag == nn_constants.NN_IDENTITY_ACTIVATION)
		activation = nn_identity;
	
	else if (flag == nn_constants.NN_RELU_ACTIVATION)
		activation = nn_relu;
	
	else if (flag == nn_constants.NN_SIGMOID_ACTIVATION)
		activation = nn_sigmoid;
	
	else if (flag == nn_constants.NN_HYPERBOLIC_TANGENT_ACTIVATION)
		activation = nn_hyperbolic_tangent;

	return activation;
}


let nn_get_activation_prime = function (flag)
{
	let activation_prime;

	if (flag == nn_constants.NN_IDENTITY_ACTIVATION)
		activation_prime = nn_identity_prime;
	
	else if (flag == nn_constants.NN_RELU_ACTIVATION)
		activation_prime = nn_relu_prime;
	
	else if (flag == nn_constants.NN_SIGMOID_ACTIVATION)
		activation_prime = nn_sigmoid_prime;
	
	else if (flag == nn_constants.NN_HYPERBOLIC_TANGENT_ACTIVATION)
		activation_prime = nn_hyperbolic_tangent_prime;

	return activation_prime;
}


let nn_apply_activation = function (
	nn, layer
)
{
	let line = new Error().lineNumber + 1;
	if (layer < 0 || layer >= nn.nlayers-1)
	{
		ut.ut_errmsg (
			"Invalid index for layer.",
			"neuralnet.js", line, 1
		);
	}

	line = new Error().lineNumber + 1;
	if (nn.Z[layer] == null)
	{
		ut.ut_errmsg (
			"nn.Z[layer] is null.",
			"neuralnet.js", line, 1
		);
	}

	let output;
	let activation_code = nn.activations[layer];

	if (activation_code == nn_constants.NN_SOFTMAX_ACTIVATION)
	{
		output = nn_softmax_of_layer(nn,layer);
	}
	else 
	{
		output = new la.Vec2D(nn.Z[layer].m, nn.Z[layer].n);
		la.vec_apply_to(
			output, nn.Z[layer],
			nn_get_activation(nn.activations[layer])
		);
	}

	return output;
}

let nn_apply_activation_prime = function (
	nn, layer
)
{
	let line = new Error().lineNumber + 1;
	if (layer < 0 || layer >= nn.nlayers-1) {
		ut_errmsg (
			"Invalid index for layer.",
			"neuralnet.js", line, 1
		);
	}

	line = new Error().lineNumber + 1;
	if (nn.Z[layer] == null) {
		ut.ut_errmsg (
			"nn.Z[layer] is null.",
			"nerualnet.js", line, 1
		);
	}

	let output;
	let activation_code = nn.activations[layer];

	if (activation_code == nn_constants.NN_SOFTMAX_ACTIVATION)
	{
		output = nn_softmax_prime_of_layer(nn,layer);
	}
	else 
	{
		output = new la.Vec2D(nn.Z[layer].m,nn.Z[layer].n);
		la.vec_apply_to(
			output, nn.Z[layer],
			nn_get_activation_prime(nn.activations[layer])
		);
	}

	return output;
}



// // IDENTITY ACTIVATION ------------------------------------
let nn_identity = function (k)
{
	let x = k;
	return fmax(0.0,x);
}


let nn_identity_prime = function (k)
{
	let x = k;
	let y = 1.0;
	return y;
}
// //---------------------------------------------------------



// // ReLU ACTIVATION ----------------------------------------
const RELU_THRESHOLD = 10;

let nn_relu = function (k)
{
	let x = k;
	let y = k > 0 ? k : 0;

	// Trying to clip...
	// if (y > RELU_THRESHOLD)
	// 	y = RELU_THRESHOLD;

	return y;
}

let nn_relu_prime = function (k)
{
	let x = k;
	let y = k > 0 ? 1 : 0;
	
	return y;
}
// //---------------------------------------------------------



// // SIGMOID ACTIVATION -------------------------------------
let nn_sigmoid = function (k)
{
	let x = parseFloat(k);
	let y = 1/(1+Math.exp(-x));
	return y;
}

let nn_sigmoid_prime = function (k)
{
	// double x = (double) k;
	// double y = exp(-x) / pow(1+exp(-x),2);

	// A little bit more efficient...
	let sig = nn_sigmoid(k);
	let y   = sig * (1.0-sig);
	
	return y;
}
// //---------------------------------------------------------



// // HYPERBOLIC TANGENT ACTIVATION --------------------------
let nn_hyperbolic_tangent = function (k)
{
	let x = k;
	// double y = (exp(x)-exp(-x))/(exp(x)+exp(-x));

	let expx    = Math.exp(x);
	let expnegx = Math.exp(-x);
	
	// A little bit more efficient...
	let y = (expx - expnegx) / (expx + expnegx);

	return y;
}

let nn_hyperbolic_tangent_prime = function (k)
{
	let x = k;
	let y = 1 - pow(tanh(x),2);
	return y;
}
// //---------------------------------------------------------



let nn_softmax_of_layer = function (
    nn, layer
)
{
	let line = new Error().lineNumber + 1;
	if (layer < 0 || layer >= nn.nlayers-1) {
		ut_errmsg (
			"Invalid index for layer.",
			"neuralnet.js", line, 1
		);
	}
	line = new Error().lineNumber + 1;
	if (nn.Z[layer] == null) {
		ut_errmsg (
			"nn.Z[layer] is null.",
			"neuralnet.js", line, 1
		);
	}

	// Reference: "https://deepnotes.io/softmax-crossentropy"
	//-------------------------------------------------------
	// def stable_softmax(X):
    // 	 exps = np.exp(X - np.max(X))
    // 	 return exps / np.sum(exps)
	//-------------------------------------------------------

	// We will create a vector with exp sums...
	let output = la.vec_clone(nn.Z[layer]);

	// Making softmax numerically stable...
	let rowsmax = la.vec_get_rows_max(output);
	for (let i = 0; i < output.m; i++)
	{
		for (let j = 0; j < output.n; j++)
		{
			let elem = la.vec_get(output, i, j);
			let rowmax = la.vec_get(rowsmax, i, 0);
			la.vec_set(output, i, j, elem-rowmax);
		}
	}

	// Calculating softmax output
	la.vec_apply(output,la.vec_exp_op);
	let sums = la.vec_get_rows_sums(output);
	for (let i = 0; i < output.m; i++)
	{
		for (let j = 0; j < output.n; j++)
		{
			let elem = la.vec_get(output, i,j);
			let sum  = la.vec_get(sums, i,0);
			la.vec_set(output, i,j, elem/sum);
		}
	}

	return output;
}


let nn_softmax_prime_of_layer = function (
    nn, layer
)
{
	let line = new Error().lineNumber + 1;
	if (layer < 0 || layer >= nn.nlayers-1) {
		ut_errmsg (
			"Invalid index for layer.",
			__FILE__, line, 1
		);
	}
	line = new Error().lineNumber + 1;
	if (nn.Z[layer] == null) {
		ut_errmsg (
			"nn.Z[layer] is null.",
			__FILE__, line, 1
		);
	}

	// We will create a vector with exp sums...
	let output = la.vec_clone(nn.Z[layer]);
	la.vec_apply(output,la.vec_exp_op);
	let sums = la.vec_get_rows_sums(output);

	for (let i = 0; i < output.m; i++)
	{
		for (let j = 0; j < output.n; j++)
		{
			let elem  = la.vec_get(output, i,j);
			let sum   = la.vec_get(sums, i,0);
			let deriv = (elem * (sum-elem))/(sum*sum);
			la.vec_set(output, i,j, deriv);
		}
	}

	return output;
}


let nn_regularization_term = function (nn)
{
	let sum      = 0.0;
	let result   = 0.0;
	let wsquared = null;

	if (nn.regularization == nn_constants.NN_L2_REGULARIZATION)
	{
		for (let i = 0; i < nn.nlayers-1; i++)
		{
			wsquared = la.vec_apply_out(nn.W[i], la.vec_square_op);
			sum += la.vec_inner_sum(wsquared);
		}

		sum *= nn.regularization_rate;
	}

	return result;
}


export default {
    NeuralNetwork: NeuralNetwork,
    nn_constants: nn_constants,
    nn_initialize_weights: nn_initialize_weights,
    nn_set_cost_function: nn_set_cost_function,
    nn_set_layer_activation: nn_set_layer_activation,
    nn_set_layers_activation: nn_set_layers_activation,
    nn_set_output_activation: nn_set_output_activation,
    nn_forward: nn_forward,
    nn_feed_forward: nn_feed_forward,
    nn_cost_func: nn_cost_func,
    nn_cost_func_gradient: nn_cost_func_gradient,
    nn_cost_func_prime: nn_cost_func_prime,
    nn_backpropagation: nn_backpropagation,
    nn_backpropagation_sgd: nn_backpropagation_sgd,
}