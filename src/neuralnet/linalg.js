import _ from 'lodash';
import util from './util.js';


// Class Vec2D
let Vec2D = function (m, n) 
{
    this.vec = _.fill(Array(m*n), 0.0);
    this.m = m; this.rows = m;
    this.n = n; this.columns = n;
    this.size = m*n; this.length = m*n;
}


let vec_new_arr = function (arr)
{
    let m = arr.length;
    let n = arr[0].length;
    let vec = new Vec2D(m, n);
    for (let i = 0; i < m; i++) 
        for (let j = 0; j < n; j++) 
            vec.set(i, j, arr[i][j]);
    
    return vec;
}


let vec_to_arr = function (vec)
{
    let arr = _.chunk(Array(vec.m*vec.n), vec.n);

    for (let i = 0; i < vec.m; i++)
        for (let j = 0; j < vec.n; j++)
            arr[i][j] = vec_get(vec, i, j);

    return arr;
}


let vec_get = function (vec, i, j)
{
    return vec.vec[i*vec.n + j];
}


let vec_set = function (vec, i, j, k)
{
    vec.vec[i*vec.n + j] = k;
}


let vec_set_all = function (vec, k)
{   
    for (let i = 0; i < vec.m; i++)
        for (let j = 0; j < vec.n; j++)
            vec_set(vec, i, j, k);
}


let vec_set_all_func = function (vec, funcptr)
{
    for (let i = 0; i < vec.m; i++)
        for (let j = 0; j < vec.n; j++)
            vec_set(vec, i, j, funcptr());
}


let vec_get_mem = function (vec)
{
    if (vec == null)
        return 0;

    let size_of_number = 8; //bytes (double precision)
    
    let mem = 6 * size_of_number;
    mem += vec.size * size_of_number;

    return mem;
}


let vec_set_row = function (vec, row, k)
{
    let line = new Error().lineNumber + 1;
    if (row < 0 || row >= vec.m) {
        util.ut_errmsg (
            "Invalid row.",
            "linalg.js", line, 1
        );
    }

    for (let j = 0; j < vec.n; j++)
        vec_set(vec, row, j, k);
}


let vec_swap_rows = function (vec, i1, i2)
{
    for (let j = 0; j < vec.n; j++) {
        let tmp1 = vec_get(vec, i1,j);
        let tmp2 = vec_get(vec, i2,j);
        vec_set(vec, i1, j, tmp2);
        vec_set(vec, i2, j, tmp1);
    }
}


let vec_copy = function (dest, src)
{
    let line = new Error().lineNumber + 1;
    if (dest.m != src.m || dest.n != src.n) {
        util.ut_errmsg (
            "Dimensions must be equal.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < dest.m; i++) {
        for (let j = 0; j < dest.n; j++) {
            let elem = vec_get(src, i, j);
            vec_set(dest, i, j, elem);
        }
    }
}


let vec_copy_portion = function (dest, src, offset, size)
{
    let line = new Error().lineNumber + 1;
    if (dest.m != src.m || dest.n != src.n) {
        util.ut_errmsg (
            "Dimensions must be equal.",
            "linalg.js", line, 1
        );
    }

    line = new Error().lineNumber + 1;
    if (offset < 0 || offset >= dest.m || size < 0 || offset+size-1 >= dest.m) {
        util.ut_errmsg (
            "Either offset and/or size are wrong.",
            "linalg.js", line, 1
        );
    }

    for (let i = offset; i < offset+size; i++) {
        for (let j = 0; j < src.n; j++) {
            let elem = vec_get(src, i, j);
            vec_set(dest, i, j, elem);
        }
    }
}


let vec_clone = function (src)
{
    let line = new Error().lineNumber + 1;
    if (src == null) 
    {
        util.ut_errmsg (
            "Pointer let is null.",
            "linalg.js", line, 1
        );
    }


    let dest = new Vec2D(src.m, src.n);
    vec_copy(dest, src);

    return dest;
}


let vec_clone_portion = function (src, offset, size)
{
    let line = new Error().lineNumber + 1;
    if (offset < 0 || offset >= src.m || size < 0 || offset+size-1 >= src.m) {
        util.ut_errmsg (
            "Either offset and/or size are wrong.",
            "linalg.js", line, 1
        );
    }

    let curr_row = 0;
    let dest = new Vec2D(size, src.n);

    for (let i = offset; i < offset+size; i++) {
        for (let j = 0; j < src.n; j++) {
            let elem = vec_get(src, i, j);
            vec_set(dest, curr_row, j, elem);
        }
        curr_row += 1;
    }

    return dest;
}


let vec_clone_portion_circ = function (src, offset, size)
{
    let line = new Error().lineNumber + 1;
    if (offset < 0 || size < 0) {
        util.ut_errmsg (
            "Either offset and/or size are wrong.",
            "linalg.js", line, 1
        );
    }

    let curr_row = 0;
    let real_offset = offset >= src.m ? offset % src.m : offset;
    let curr_offset = real_offset;

    let dest = new Vec2D(size, src.n);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < src.n; j++) {
            let elem = vec_get(src, curr_offset, j);
            vec_set(dest, curr_row, j, elem);
        }
        curr_offset = (curr_offset + 1) % src.m;
        curr_row += 1;
    }

    return dest;
}


let vec_print = function (vec)
{
    let s = "";

    for (let i = 0; i < vec.m; i++) {
        for (let j = 0; j < vec.n; j++)
            s += vec.vec[i*vec.n + j].toFixed(3) + "\t\t";
        s += "\n";
    }

    console.log(s);
}


let vec_print_portion = function (vec, portion, side)
{
    let m = portion < vec.m ? portion : vec.m;
    let n = portion < vec.n ? portion : vec.n;
    let s = "";

    if (side == 0) {
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++)
                s += vec.vec[i*vec.n + j].toFixed(4) + "\t\t";
            s += "\n";
        }
    }
    else {
        for (let i = m; i > 0; i--) {
            for (let j = n; j > 0; j--)
                s += vec_get(vec,vec.m-i,vec.n-j).toFixed(4) + "\t\t";
            s += "\n";
        }
    }

    console.log(s);
}


let vec_print_bitmap = function (bitmap, row, rows, columns)
{
    let s = "";
    s += "+";
    for (let j = 0; j < columns; j++)
        s += "-";
    s += "+\n";

    for (let i = 0; i < rows; i++) {
        s += "|";
        for (let j = 0; j < columns; j++) {
            let el = vec_get(bitmap, row, i*columns+j);
            if (el >= 0 && el < 0.2)
                s += " ";
            else if (el >= 0.2 && el < 0.4)
                s += ".";
            else if (el >= 0.4 && el < 0.6)
                s += "'";
            else if  (el >= 0.6 && el < 0.8)
                s += "*";
            else
                s += "#";
        }
        s += "|\n";
    }

    s += "+";
    for (let j = 0; j < columns; j++)
        s += "-";
    s += "+";

    console.log(s);
}


//=====================================
// REDUCTIONS
//=====================================

let vec_max = function (A)
{
    let themax = vec_get(A, 0, 0);
    
    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let k = vec_get(A, i, j);
            if (k > themax)
                themax = k;
        }
    }

    return themax;
}


let vec_min = function (A)
{
    let themin = vec_get(A, 0, 0);
    
    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let k = vec_get(A, i, j);
            if (k < themin)
                themin = k;
        }
    }

    return themin;
}


let vec_row_max = function (A, row)
{
    let line = new Error().lineNumber + 1;
    if (row < 0 || row >= A.m) {
        util.ut_errmsg (
            "Invalid row index.",
            "linalg.js", line, 1
        );
    }

    let themax = vec_get(A,row,0);
    for (let j = 0; j < A.n; j++) {
        let k = vec_get(A,row,j);
        if (k > themax)
            themax = k;
    }

    return themax;
}


let vec_row_min = function (A, row)
{
    let line = new Error().lineNumber + 1;
    if (row < 0 || row >= A.m) {
        util.ut_errmsg (
            "Invalid row index.",
            "linalg.js", line, 1
        );
    }

    let themin = vec_get(A,row,0);
    for (let j = 0; j < A.n; j++) {
        let k = vec_get(A,row,j);
        if (k < themin)
            themin = k;
    }

    return themin;
}


let vec_inner_sum = function (A)
{
    let sum = 0;

    for (let i = 0; i < A.m; i++)
        for (let j = 0; j < A.n; j++)
            sum += vec_get(A, i, j);

    return sum;
}


let vec_get_rows_sums = function (A)
{
    let sum;
    let newvec = new Vec2D(A.m, 1);

    for (let i = 0; i < A.m; i++) {
        sum = 0;
        for (let j = 0; j < A.n; j++)
            sum += vec_get(A, i, j);
        vec_set(newvec, i, 0, sum);
    }

    return newvec;
}


let vec_get_rows_max = function (A)
{
    let rows_max = new Vec2D(A.m,1);

    for (let i = 0; i < A.m; i++)
        vec_set(rows_max, i, 0, vec_row_max(A,i));
    
    return rows_max;
}


let vec_get_columns_sums = function (A)
{
    let sum;
    let newvec = new Vec2D(1, A.n);

    for (let j = 0; j < A.n; j++) {
        sum = 0.0;
        for (let i = 0; i < A.m; i++) {
            sum += vec_get(A, i, j);
        }
        vec_set(newvec, 0, j, sum);
    }

    return newvec;
}


let vec_column_max = function (A, column)
{
    let line = new Error().lineNumber + 1;
    if (column < 0 || column >= A.n) {
        util.ut_errmsg (
            "Invalid column index.",
            "linalg.js", line, 1
        );
    }

    let themax = vec_get(A, 0, column);
    for (let i = 0; i < A.m; i++) {
        let k = vec_get(A, i, column);
        if (k > themax)
            themax = k;
    }

    return themax;
}


let vec_get_columns_max = function (A)
{
    let columns_max = new Vec2D(1, A.n);

    for (let j = 0; j < A.n; j++)
        vec_set(columns_max, 0, j, vec_column_max(A, j));
    
    return columns_max;
}


//=====================================
// SELF OPERATIONS
//=====================================

let vec_transposed = function (A)
{
    let At = new Vec2D(A.n, A.m);

    for (let i = 0; i < A.m; i++)
        for (let j = 0; j < A.n; j++)
            vec_set(At, j, i, vec_get(A, i, j));

    return At;
}


//=========================================================
// ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION,
// EXPONENTIATION, NTH ROOT AND LOG BASE N...
//=========================================================

let vec_add_scalar = function (A, scalar)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A,i,j, vec_get(A,i,j) + scalar);
}


let vec_sub_scalar = function (A, scalar)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A,i,j, vec_get(A,i,j) - scalar);
}


let vec_mult_scalar = function (A, scalar)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A, i, j, vec_get(A,i,j) * scalar);
}


let vec_get_scalar_prod = function (A, scalar)
{
    let newvec = new Vec2D(A.m,A.n);

    vec_copy(newvec, A);
    vec_mult_scalar(newvec, scalar);

    return newvec;
}


let vec_div_scalar = function (A, scalar)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A,i,j, vec_get(A,i,j) / scalar);
}


let vec_exp_scalar = function (A, scalar)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A,i,j, pow(vec_get(A,i,j), scalar));
}


let vec_sqrt = function (A)
{
    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(A, i, j, Math.sqrt(vec_get(A,i,j)));
}


//======================================
// DOT PRODUCT (MATRIX MULTIPLICATION)
//======================================

let vec_dot = function (A, B, AB)
{
    let line = new Error().lineNumber + 1;
    if (A.n != B.m) {
        util.ut_errmsg (
            "Matrices are not compatible for dot product.",
            "linalg.js", line, 1
        );
    }

    // Naive algorithm
    //-----------------
    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < B.n; j++) {
            let sum = 0.0;
            for (let k = 0; k < A.n; k++) {
                sum += vec_get(A,i,k) * vec_get(B,k,j);
            }
            vec_set(AB,i,j,sum);
        }
    }

    // "Correcting" Not A Number situations
    for (let i = 0; i < AB.m*AB.n; i++)
        if (isNaN(AB.vec[i]))
            AB.vec[i] = 0.0;
}


let vec_mult = function (A, B, AB)
{
    vec_dot(A,B,AB);
}


let vec_get_dot = function (A, B)
{
    let line = new Error().lineNumber + 1;
    if (A.n != B.m) {
        util.ut_errmsg (
            "Matrices are not compatible for dot product.",
            "linalg.js", line, 1
        );
    }

    let AB = new Vec2D(A.m, B.n);
    vec_set_all(AB, 0.0);

    // Naive algorithm
    //-----------------
    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < B.n; j++) {
            let sum = 0.0;
            for (let k = 0; k < A.n; k++) {
                let product = vec_get(A,i,k) * vec_get(B,k,j);
                if (isNaN(sum + product))
                    sum += 0.0;
                else
                    sum += product;
            }
            vec_set(AB,i,j,sum);
        }
    }
    
    // "Correcting" Not A Number situations
    for (let i = 0; i < AB.m*AB.n; i++)
        if (isNaN(AB.vec[i]))
            AB.vec[i] = 0.0;

    return AB;
}


let vec_get_mult = function (A, B)
{
    return vec_get_dot(A,B);
}


//======================================
// ELEMENT-WISE MATRIX OPERATIONS
//======================================

let vec_add = function (A, B, AplusB)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(AplusB,i,j, vec_get(A,i,j) + vec_get(B,i,j));

}


let vec_get_sum = function (A, B)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    let AplusB = new Vec2D(A.m,A.n);

    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(AplusB,i,j, vec_get(A,i,j) + vec_get(B,i,j));

    return AplusB;
}


let vec_sub = function (A, B, AminusB)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(AminusB,i,j, vec_get(A,i,j) - vec_get(B,i,j));
}


let vec_get_diff = function (A, B)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    let AminusB = new Vec2D(A.m,A.n);

    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(AminusB,i,j, vec_get(A,i,j) - vec_get(B,i,j));

    return AminusB;
}


let vec_mult_elwise = function (A, B, AB)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < A.m; i++) 
        for (let j = 0; j < A.n; j++) 
            vec_set(AB,i,j, vec_get(A,i,j) * vec_get(B,i,j));
}


let vec_get_mult_elwise = function (A, B)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    let AB = new Vec2D(A.m,A.n);

    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let bij = vec_get(B,i,j);
            vec_set(AB,i,j, vec_get(A,i,j) * bij);
        }
    }

    return AB;
}


let vec_div_elwise = function (A, B, AdivB)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let bij = vec_get(B,i,j);
            let den = bij == 0.0 ? 0.00001 : bij; // Dont divide by 0
            vec_set(AdivB,i,j, vec_get(A,i,j) / vec_get(B,i,j));
        }
    }
}


let vec_get_div_elwise = function (A, B)
{
    let line = new Error().lineNumber + 1;
    if (A.m != B.m || A.n != B.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    let AdivB = new Vec2D(A.m, A.n);

    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let bij = vec_get(B,i,j);
            let den = bij == 0.0 ? 0.00001 : bij; // Dont divide by 0
            vec_set(AdivB, i, j, vec_get(A,i,j) / den);
        }
    }

    return AdivB;
}


let vec_sum_row = function (A, row, arr)
{
    let line = new Error().lineNumber + 1;
    if (row < 0 || row >= A.m) {
        util.ut_errmsg (
            "Invalid row.",
            "linalg.js", line, 1
        );
    }

    for (let j = 0; j < A.n; j++)
        vec_set(A,row,j, vec_get(A,row,j) + arr[j]);
}


//=========================================================
// APPLY FUNCTION ELEMENT-WISE
//=========================================================

let vec_apply = function (A, op)
{
    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let elem = vec_get(A,i,j);
            let result = op(elem);
            vec_set(A,i,j,result);
        }
    }
}


let vec_apply_to = function (dst, src, op)
{
    let line = new Error().lineNumber + 1;
    if (dst.m != src.m || dst.n != src.n) {
        util.ut_errmsg (
            "Matrices are not of the same order.",
            "linalg.js", line, 1
        );
    }

    for (let i = 0; i < src.m; i++) {
        for (let j = 0; j < src.n; j++) {
            let elem = vec_get(src,i,j);
            let result = op(elem);
            vec_set(dst,i,j,result);
        }
    }
}


let vec_apply_out = function (A, op)
{
    let out = new Vec2D(A.m,A.n);

    for (let i = 0; i < A.m; i++) {
        for (let j = 0; j < A.n; j++) {
            let elem = vec_get(A,i,j);
            let result = op(elem);
            vec_set(out,i,j,result);
        }
    }

    return out;
}


let vec_square_op = function (elem)
{
    return elem * elem;
}


let vec_sqrt_op = function (elem)
{
    return Math.sqrt(elem);
}


let vec_log_op = function (elem)
{
    return Math.log(elem);
}


let vec_exp_op = function (elem)
{
    return Math.exp(elem);
}


export default {
    Vec2D: Vec2D,
    vec_new_arr: vec_new_arr,
    vec_to_arr: vec_to_arr,
    vec_get: vec_get,
    vec_set: vec_set,
    vec_set_all: vec_set_all,
    vec_set_all_func: vec_set_all_func,
    vec_get_mem: vec_get_mem,
    vec_set_row: vec_set_row,
    vec_swap_rows: vec_swap_rows,
    vec_copy: vec_copy,
    vec_copy_portion: vec_copy_portion,
    vec_clone: vec_clone,
    vec_clone_portion: vec_clone_portion,
    vec_clone_portion_circ: vec_clone_portion_circ,
    vec_print: vec_print,
    vec_print_portion: vec_print_portion,
    vec_print_bitmap: vec_print_bitmap,
    vec_max: vec_max,
    vec_min: vec_min,
    vec_row_max: vec_row_max,
    vec_row_min: vec_row_min,
    vec_inner_sum: vec_inner_sum,
    vec_get_rows_sums: vec_get_rows_sums,
    vec_get_rows_max: vec_get_rows_max,
    vec_get_columns_max: vec_get_columns_max,
    vec_get_columns_sums: vec_get_columns_sums,
    vec_transposed: vec_transposed,
    vec_add_scalar: vec_add_scalar,
    vec_sub_scalar: vec_sub_scalar,
    vec_mult_scalar: vec_mult_scalar,
    vec_get_scalar_prod: vec_get_scalar_prod,
    vec_div_scalar: vec_div_scalar,
    vec_exp_scalar: vec_exp_scalar,
    vec_sqrt: vec_sqrt,
    vec_dot: vec_dot,
    vec_mult: vec_mult,
    vec_get_dot: vec_get_dot,
    vec_get_mult: vec_get_mult,
    vec_add: vec_add,
    vec_get_sum: vec_get_sum,
    vec_sub: vec_sub,
    vec_get_diff: vec_get_diff,
    vec_mult_elwise: vec_mult_elwise,
    vec_get_mult_elwise: vec_get_mult_elwise,
    vec_div_elwise: vec_div_elwise,
    vec_get_div_elwise: vec_get_div_elwise,
    vec_sum_row: vec_sum_row,
    vec_apply: vec_apply,
    vec_apply_to: vec_apply_to,
    vec_apply_out: vec_apply_out,
    vec_square_op: vec_square_op,
    vec_sqrt_op: vec_sqrt_op,
    vec_log_op: vec_log_op,
    vec_exp_op: vec_exp_op
}