import _ from 'lodash';
import './assets/css/style.css';
// import Icon from './assets/img/icon.png';
import Diabetes from '../data/diabetes.csv';
// import test1 from './tests/test1.js';
import test2 from './tests/test2.js';


function component() 
{
    const element = document.createElement('div');
    
    element.innerHTML = _.join(['Live', 'Artificial', 'Neural', 'Network'], ' ');
    element.classList.add('hello');

    // const myIcon = new Image();
    // myIcon.src = Icon;
    // element.appendChild(myIcon);   
    
    return element;
}

document.body.appendChild(component());
console.log(_.take(Diabetes,8)); 

window.onload = function()
{
    document.getElementById('mycanvas1').classList.add('mycanvas1');
    document.getElementById('mycanvas2').classList.add('mycanvas2');
    document.getElementById('myChart').classList.add('myChart');

    // test1();
    test2();
};