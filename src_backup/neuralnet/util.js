let ut_msleep = function (ms)
{
    setTimeout(function(){}, ms);
}


let ut_time_in_msec = function()
{
    return Date.now();
}


let ut_interval_in_msec = function (t0, t1) // in miliseconds
{
    return t1-t0;
}


let ut_errmsg = function (msg, file, line, stop_flag)
{
    console.error("Error at "+file+":"+line+". ");
    console.error(""+msg+"\n");

    if (stop_flag === 1) {
        throw new Error();
    }
}


let ut_rand = function() 
{
    let RAND_MAX = 3278;
    let min = 0;
    let max = RAND_MAX;
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}


let ut_gaussian_noise = function (mu, sigma)
{
    let RAND_MAX = 3278;
    function rand() {
        let min = 0;
        let max = RAND_MAX;
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    const epsilon = Number.MIN_VALUE;
    const two_pi = 2.0*3.14159265358979323846;

    let z0, z1;
    let generate;
    generate = !generate;

    if (!generate)
        return z1 * sigma + mu;

    let u1, u2;
    do {
        u1 = rand() * (1.0 / RAND_MAX);
        u2 = rand() * (1.0 / RAND_MAX);
    } while ( u1 <= epsilon );

    z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(two_pi * u2);
    z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(two_pi * u2);
    return z0 * sigma + mu;
}


let ut_gaussian_rand = function()
{
    return ut_gaussian_noise(0,1);
}


export default 
{
    ut_msleep : ut_msleep,
    ut_time_in_msec : ut_time_in_msec,
    ut_interval_in_msec : ut_interval_in_msec,
    ut_errmsg : ut_errmsg,
    ut_rand: ut_rand,
    ut_gaussian_noise : ut_gaussian_noise,
    ut_gaussian_rand : ut_gaussian_rand,
}