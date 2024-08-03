//if(innerWidth<=425){
    var canvas ={width: innerWidth, height: innerHeight - 8}
//}else{
    //var screen = {width: innerWidth - 500, height: innerHeight - 8}
//}
const canvas = document.querySelector(‘canvas’);
canvas.width = canvas.width;
canvas.height = canvas.height;

const c = canvas.getContext(‘2d’);




// ---------------------------------------ZOOM IN / PANNING--------------------------------------------------

var universeSize = 3;

var universeWidth = canvas.width * universeSize; 
var universeHeight = canvas.height * universeSize; 


trackTransforms(c)


function redraw(){
    // Clear the entire canvas
    var p1 = c.transformedPoint(0,0);
    var p2 = c.transformedPoint(canvas.width,canvas.height);
    c.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

    c.save();
    if (!CanvasRenderingContext2D.prototype.resetTransform) {
        CanvasRenderingContext2D.prototype.resetTransform = function() {
            this.setTransform(1, 0, 0, 1, 0, 0);
        };
    }
    // c.setTransform(1,0,0,1,0,0);
    c.clearRect(0,0,universeWidth,universeHeight);
    c.restore();
}
// redraw();

var lastX=canvas.width/2, lastY=canvas.height/2;

var dragStart,dragged;

canvas.addEventListener(‘mousedown’,function(evt){
    if(evt.button == 1){
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = ‘none’;
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = c.transformedPoint(lastX,lastY);
        dragged = false;
    }
},false);


canvas.addEventListener(‘mousemove’,function(evt){
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart){
        var pt = c.transformedPoint(lastX,lastY);
        c.translate(pt.x-dragStart.x,pt.y-dragStart.y);
        redraw();
    }
    drawAll();
},false);

canvas.addEventListener(‘mouseup’,function(evt){
    dragStart = null;
},false);

var scaleFactor = 1.05;

var zoom = function(clicks){
    var pt = c.transformedPoint(lastX,lastY);
    c.translate(pt.x,pt.y);
    var factor = Math.pow(scaleFactor,clicks);
    c.scale(factor,factor);
    c.translate(-pt.x,-pt.y);
    redraw();
    drawAll();
}


var handleScroll = function(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta){
        zoom(delta);
    }
    return evt.preventDefault() && false;
};

canvas.addEventListener(‘DOMMouseScroll’,handleScroll,false);
canvas.addEventListener(‘mousewheel’,handleScroll,false);


// Adds c.getTransform() - returns an SVGMatrix
// Adds c.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(c){
    var svg = document.createElementNS(‘http://www.w3.org/2000/svg’,‘svg’);
    var xform = svg.createSVGMatrix();
    c.getTransform = function(){ return xform; };

    var savedTransforms = [];
    var save = c.save;
    c.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(c);
    };

    var restore = c.restore;
    c.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(c);
    };

    var scale = c.scale;
    c.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(c,sx,sy);
    };

    var rotate = c.rotate;
    c.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(c,radians);
    };

    var translate = c.translate;
    c.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(c,dx,dy);
    };

    var transform = c.transform;
    c.transform = function(a,b,c,d,e,f){
        var m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(c,a,b,c,d,e,f);
    };

    var setTransform = c.setTransform;
    c.setTransform = function(a,b,c,d,e,f){
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(c,a,b,c,d,e,f);
    };

    var en = svg.createSVGPoint();
    c.transformedPoint = function(x,y){
        pt.x=x; pt.y=y;
        return pt.matrixTransform(xform.inverse());
    }
}



// ------------------------------------------------------------------------------------------------------------------





var hunger_c = 0.8; // percentage of maximum energy above which they will not eat
var hunger_h = 0.8; // percentage of maximum energy above which they will not eat

var changeGraph = false;

// Variables for the graph (herbivore)
var popH;
var velMedH;
var forceMedH;
var radiusMedH;
var radiusDetMedH;
var energMedH;
var rateEnergMedH;

// Variables for the graph (carnivore)
var popC;
var velMedC;
var forceMedC;
var radiusMedC;
var radiusDetMedC;
var energMedC;

var rateEnergMedC;

// Variables for mutation changes
// var probability_mutation = labelProb; // chances of each gene (attribute) being mutated
var magnitude_mutation = 0.1; // magnitude of the mutation (how much it will vary)

var right_side_empty = true;
var left_side_empty = true;

// QuadTree
let rectangleCanvas = new Rectangle(universeWidth/2, universeHeight/2, universeWidth/2, universeHeight/2);

var popover_id = 1;

// Settings for edited organisms
var conf_c;
var conf_h;



// ---------------------------------------------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------------------------------------------

function createUniverse(sizeUniverse){
    universeWidth = canvas.width * sizeUniverse; 
    universeHeight = canvas.height * sizeUniverse;
}

function verifyViesChanges(value, iterations){
    var smaller = 0;
    var greater = 0;
    var equal = 0;
    var newValue = 0;
    for(var i = 0; i < iterations; i++){
        newValue = newChange(value)
        if(newValue > value){
            bigger++;
        } else if(newValue < value){
            smaller++;
        } else{
            equal++;
        }
    }

    console.log(‘Largest: “ + ((largest * 100)/iterations) + ”%’)
    console.log(‘Smallest: “ + ((smallest * 100)/iterations) + ”%’)
    console.log(‘Equal: “ + ((equal * 100)/iterations) + ”%’)
    console.log(‘Mutations: “ + (((highest + lowest) * 100)/iterations) + ”%’)
}

function verifyViesMutationsBatch(brood_min, brood_max, iterations){
    var smallest = 0;
    var largest = 0;
    var equal = 0;
    var average_nest = (min_nest + max_nest) / 2;
    for(var i = 0; i < iterations; i++){
        newInterval = mutationLitter(litter_min, litter_max)
        new_medium_nest = (newInterval[0] + newInterval[1]) / 2
        if(new_median_nest > median_nest){
            larger++;
        } else if(new_media_nest < media_nest){
            smaller++;
        } else{
            equal++;
        }
    }

    console.log(‘Largest: “ + ((largest * 100)/iterations) + ”%’)
    console.log(‘Smallest: “ + ((smallest * 100)/iterations) + ”%’)
    console.log(‘Equal: “ + ((equal * 100)/iterations) + ”%’)
    console.log(‘Mutations: “ + (((highest + lowest) * 100)/iterations) + ”%’)
}

// Function to avoid the need to unpause() and pause() when redrawing elements without playing animate().
function drawAll(){
    Food.food.forEach(a => {
        a.display();
    })
    Organism.organisms.forEach(o => {
        o.display();
    })
}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = ‘’;
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? ‘’ : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/‘’/g, ‘’‘’‘’);
            result = result.replace(‘.’, ‘,’)
            if (result.search(/("|,|\n)/g) >= 0)
                result = ‘’‘ + result + “”’;
            if (j > 0)
                finalVal += ‘;’;
            finalVal += result;
        }
        return finalVal + ‘\n’;
    };

    var csvFile = ‘’;
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: ‘text/csv;charset=utf-8;’ });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement(‘a’);
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute(‘href’, url);
            link.setAttribute(‘download’, filename);
            link.style.visibility = ‘hidden’;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


function createObjects(n_carnivores, n_herbivores, n_food){
    for(var i = 0; i < n_carnivores; i++){
        var x = (Math.random() * (universeWidth - 50) + 25);
        var y = (Math.random() * (universeHeight - 50) + 25);
        generateCarnivore(x,y);
    }
    for(var i = 0; i < n_herbivores; i++){
        var x = (Math.random() * (universeWidth - 50) + 25);
        var y = (Math.random() * (universeHeight - 50) + 25);
        generateHerbivore(x,y);    
    }
    for(var i = 0; i < n_food; i++){
        var x = (Math.random() * (universeHeight - 50) + 25);
        var y = (Math.random() * (universeHeight - 50) + 25);
        generateFood(x,y);
    }
}

function destroyObjects(){
    Carnivore.carnivores.length = 0;
    Herbivore.herbivores.length = 0;
    Food.food.length = 0;
    // changeFoodInterval(1001);
}


// creates more feeds over time
// the setInterval() function allows it to call the loop every x milliseconds
var intervalFoodRate;

// helper variables for implementing screen splitting
var checkbox_split = document.getElementById(‘split’);
var screenSplit;
var loop_limiter = 0;

function generateFood(x,y){
    var radius = generateNumberByInterval(1, 2);
    return new Food(x, y, radius);
}

function geraCarnivoro(x,y){ // function to add more carnivores manually 
    var radius_initial = generateNumberByInterval(3, 8);
    var vel_max = generateNumberByInterval(1, 2.2); 
    var force_max = generateNumberByInterval(0.01, 0.05);
    var colour = generateColour();
    var initial_detection_radius = generateNumberByInterval(40, 120);
    var litter_min = generateInteger(1, 1);
    var max_nest = min_nest + generateInterval(1, 8);
    var litter_range = [litter_min, litter_max];
    var sex;

    if(Math.random() < 0.5){
        sex = ‘XX’
    } else{
        sex = ‘XY’
    }

    if(conf_c) {
        start_radius = conf_c.start_radius;
        vel_max = conf_c.vel_max;
        max_force = conf_c.max_force;
        colour = conf_c.colour;
        interval_nested = conf_c.interval_nested
        gender = conf_c.gender
    }

    var dna = new DNA(
        start_radius,
        vel_max,
        max_force,
        colour,
        initial_decay_radius,
        litter_interval,
        gender
    )

    return new Carnivore(
        x, y, dna
    );
}


function geraHerbivoro(x,y){ // function to add more herbivores manually    
    var initial_radius = generateNumberByInterval(3, 8);
    var vel_max = generateNumberByInterval(1, 2.2); 
    var force_max = generateNumberByInterval(0.01, 0.05);
    var colour = generateColour();
    var initial_detection_radius = generateNumberByInterval(40, 120);
    var litter_min = generateInteger(1, 1);
    var max_nest = min_nest + generateInterval(1, 8);
    var litter_range = [litter_min, litter_max];
    var sex;

    if(Math.random() < 0.5){
        sex = ‘XX’
    } else{
        sex = ‘XY’
    }

    if(conf_h) {
        initial_radius = conf_h.initial_radius;
        vel_max = conf_h.vel_max;
        max_force = conf_h.max_force;
        colour = conf_h.colour;
        interval_nested = conf_h.interval_nested;
        gender = conf_h.gender;
    }

    var dna = new DNA(
        start_radius,
        vel_max,
        max_force,
        colour,
        initial_decay_radius,
        litter_interval,
        gender
    )

    return new Herbivore(
        x, y, dna
    );
}


function generateColour(){
    // variables for generating colours
    var r = Math.floor(Math.random() * 256); 
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var colour = ‘rgb(’ + r + ‘,’ + g + ‘,’ + b + ‘)’;

    return colour;
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        ‘rgb(’
        + parseInt(result[1], 16) + ’,’
        + parseInt(result[2], 16) + ’,’
        + parseInt(result[3], 16)
        + ‘)’
    : null;
}

function rgbToHex(rgb) {
    let result = /^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/i.exec(rgb)
    if(!result) return null;

    let r = parseInt(result[1]).toString(16)
    let g = parseInt(result[2]).toString(16)
    let b = parseInt(result[3]).toString(16)
    
    return `#${r.length<2? ‘0"+r:r}${g.length<2? ‘0"+g:g}${b.length<2? ‘0"+b:b}`
}

function colourChange(style) {
    if(Math.random() < probability_mutation){ // The lower the probability_mutation, the lower the chance of the mutation occurring
        let colours = style.substring(4, style.length - 1) // remove text characters. ex: ‘rgb(256,20,40)’
            .split(‘,’) // return an array with the elements separated by a comma. e.g. 256,20,40
            .map(function(colour) { // grab each element from the array and do the following calculations
                colour = parseInt(colour);
                let operation = ‘’;
                let p = Math.random();

                if(colour <= 10) { //not to generate negative numbers
                    operation = ‘addition’
                } else if(colour >= 246) { //not to generate values greater than 256
                    operation = ‘subtraction’

                } else { //randomise whether to add or subtract values if the colour is between 10 and 246
                    if(Math.random() < 0.5) {
                        operation = ‘addition’
                    } else {
                        operation = ‘subtraction’
                    }
                }

              if(operation == ‘addition’) {
                    if(p < 0.002){ // There is a 0.2% chance that the mutation is large
                        return Math.ceil(colour + colour * (Math.random() * mutation_magnitude * 10));
                    } else if(p < 0.008){ // There is a 0.6% chance (0.8% - the 0.2% from the previous if) that the mutation is reasonably large
                        return Math.ceil(colour + colour * (Math.random() * mutation_magnitude * 4));
                    } else if(p < 0.028){ // There is a 2% chance (2.8% - the 0.8% from the previous if) that the mutation is reasonable
                        return Math.ceil(colour + colour * (Math.random() * mutation_magnitude * 2));
                    } else{
                        // return colour + Math.ceil(Math.random() * 10)
                        return Math.ceil(colour + colour * (Math.random() * magnitude_change));
                    }
                    
                } else { //subtraction
                    if(p < 0.002){ // There is a 0.2% chance that the mutation is large
                        return Math.ceil(colour - colour * (Math.random() * mutation_magnitude * 10));
                    } else if(p < 0.008){ // There is a 0.6% chance (0.8% - the 0.2% from the previous if) that the mutation is reasonably large
                        return Math.ceil(colour - colour * (Math.random() * mutation_magnitude * 4));
                    } else if(p < 0.028){ // There is a 2% chance (2.8% - the 0.8% from the previous if) that the mutation is reasonable
                        return Math.ceil(colour - colour * (Math.random() * mutation_magnitude * 2));
                    } else{
                        return Math.ceil(colour - colour * (Math.random() * magnitude_change));
                    }
                }
            });
        
        // console.log(‘COLOUR CHANGE’);
        return `rgb(${cores[0]},${cores[1]},${cores[2]})`
    } else{
        return style;
    }
}

function newChange(value) {// example: value = 20; change_magnitude = 0.05 || 5%
    if(Math.random() < probability_mutation){ // The lower the probability_mutation, the lower the chance of the mutation occurring
        let p = Math.random();
        let variance = value * mutation_magnitude; // variance = 20 * 0.05 = 1, i.e. it can vary from +1 to -1 in the result
        if(p < 0.001){ // There is a 0.1% chance that the mutation is very large
            variance *= 10;
        } else if(p < 0.003){ // There is a 0.2% chance (0.3% - 0.1% from the previous if) that the mutation is large
            variance *= 6;
        } else if(p < 0.008){ /// There is a 0.5% chance (0.8% - the 0.3% from the previous if) that the mutation is reasonably large
            variance *= 3.5;
        } else if(p < 0.028){ // There is a 2% chance (2.8% - the 0.8% from the previous if) that the mutation is reasonably
            variance *= 2;
        }
        
        let min = value - variance; // min = 20 - 1 = 19. So that you don't have to sub-divide the return in addition or subtraction
        variacao *= 2 // pull the reference point to the smallest possible value. Therefore, the result will vary from
                                        // 0 to +2, since the distance from 1 to -1 is 2.
        if(minimum <= 0) {
            min = value * 0.01; // If the mutation decreases the value to less than 0, it will simply be too small
        }
        // console.log(‘MUTATION’);
        return minimo + Math.random() * variacao; // 19 + Math.randon() * 2. The result will be in the range [19, 21]
    } else{ // If no mutation occurs, return the original value
        return value;
    }
}

function mutationBreed(brood_min, brood_max) {
    if(Math.random() < probability_mutation){ // The lower the probability_mutation, the lower the chance of the mutation occurring
        let variacao_ninhada_min = geraInteiro(0, 2 + Math.floor(magnitude_mutacao * 10));
        let variacao_ninhada_max = geraInteiro(0, 2 + Math.floor(magnitude_mutacao * 10));
 
        if(Math.random() >= 0.5) { // Sum
            litter_min += litter_min_variance;
            litter_max += litter_max_variance;
        } else{ // Subtract
            litter_min -= litter_min variance;
            litter_max -= litter_max_variance;
        }

        if(litter_min <= 0) {
            litter_min = 0;
        }
        if(litter_max <= litter_min) {
            litter_max = litter_min + 1;
        }
    }
    
    return [litter_min, litter_max];
}



function generateNumberByInterval(min, max) {
    let delta = max - min; // example: 4000 and 6000. 6000 - 4000 = 2000
    return parseFloat((Math.random() * delta + min).toFixed(4)); // Math.random() * 2000 + 4000
}

function createGradativeFood(){
    if(!paused){ // Stop creating food while the simulation is paused
        if(screenSplit){
            if(left_side_empty){ // If there is no population on the left side, no food will be generated there
                var x = generateNumberByInterval(universeWidth/2 + 31, universeWidth - 31);
                       var y = Math.random() * (universeHeight - 62) + 31;
                var radius = Math.random() * 1.5 + 1;
    
                if(Alimento.alimentos.length < 3000){ // Limiter so as not to overload the simulation
                    new Food(x, y, radius);
                }
            }
            if(right_side_empty){ // If there is no population on the right side, no food will be generated there
                var x = generateNumberByInterval(31, universeWidth/2 - 31);
                var y = Math.random() * (universeHeight - 62) + 31;
                var radius = Math.random() * 1.5 + 1;
    
                if(Alimento.alimentos.length < 3000){ // Limiter so as not to overload the simulation
                    new Food(x, y, radius);
                }
            }
            if(!right_side_empty && !left_side_empty){
                var x = Math.random() * (universeWidth - 62) + 31;
                var y = Math.random() * (universeHeight - 62) + 31;
                var radius = Math.random() * 1.5 + 1;

                if(Alimento.alimentos.length < 3000){ // Limiter so as not to overload the simulation
                    new Food(x, y, radius);
                }
            }
        } else{
            var x = Math.random() * (universeWidth - 62) + 31;
            var y = Math.random() * (universeHeight - 62) + 31;
            var radius = Math.random() * 1.5 + 1;

            if(Alimento.alimentos.length < 3000){ // Limiter so as not to overload the simulation
                new Food(x, y, radius);
            }
        }
    }
}

function changeFoodInterval(newValue, create=false) {
    newTime = 1000 / newValue
    if(!create) {
        clearInterval(intervalFoodRate);
    }
    if(newTime > 1000) return;
    if(beforeDoPlay) return;
    intervalFoodRate = setInterval(createFoodGradative, newTime)
}

function changeProbMutation(newValue){
    probability_change = newValue / 100;
}

function changeMagChange(newValue){
    magnitude_change = newValue / 100;
}

function drawDivision(){
    c.beginPath();
    c.moveTo(universeWidth / 2, 0);
    c.lineTo(universeWidth / 2, universeHeight);
    c.strokeStyle = ‘white’;
    c.stroke();
}

function drawQuadTree(qtree){
    qtree.draw();

    let range = new Rectangle(Math.random() * universeWidth, Math.random() * universeHeight, 170, 123);
    c.rect(range.x - range.w, range.y - range.h, range.w*2, range.h*2);
    c.strokeStyle = ‘green’;
    c.lineWidth = 3;
    c.stroke();

    let points = qtree.search(range);
    for(let p of pontos){
        c.beginPath();
        c.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        c.strokeStyle = ‘red’;
        c.stroke();
    }
}

function createPoint(){
    let congregation = new Point(Math.random() * universeWidth, Math.random() * universeHeight);
    
    for(var i = 0; i < 500; i++){
        let p = new Point(Math.random() * universeWidth, Math.random() * universeHeight);
        qtree.insertPoint(p);
    }
    for(var i = 0; i < 300; i++){
        let p = new Point(congregation.x + (Math.random() - 0.5) * 300, congregation.y + (Math.random() - 0.5) * 300);
        qtree.insertPoint(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Point(congregation.x + (Math.random() - 0.5) * 600, congregation.y + (Math.random() - 0.5) * 600);
        qtree.insertPoint(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Point(congregation.x + (Math.random() - 0.5) * 800, congregation.y + (Math.random() - 0.5) * 800);
        qtree.insertPoint(p);
    }
}

function calculateGraphData(){
    // Free up memory space from previous variables
    popH = velMedH = forcaMedH = radiusMedH = radiusDetMedH = energMedH = rateEnergMedH = nestedMediaH = null;
    popC = velMedC = forcaMedC = radiusMedC = radiusDetMedC = energMedC = rateEnergMedC = litterMediaC = null;

    // Resetting the variables for the herbivores
    popH = {no_div: 0, left: 0, right: 0}
    velMedH = {without_div: 0, left: 0, right: 0};
    forceMedH = {without_div: 0, left: 0, right: 0};
    radiusMedH = {without_div: 0, left: 0, right: 0};
    radiusDetMedH = {without_div: 0, left: 0, right: 0};
    energMedH = {without_div: 0, left: 0, right: 0};
    rateEnergMedH = {without_div: 0, left: 0, right: 0};
    litterMedH = {without_div: 0, left: 0, right: 0};

    // Resetting the variables for the carnivores
    popC = {without_div: 0, left: 0, right: 0}
    velMedC = {without_div: 0, left: 0, right: 0};
    forceMedC = {without_div: 0, left: 0, right: 0};
    radiusMedC = {without_div: 0, left: 0, right: 0};
    radiusDetMedC = {without_div: 0, left: 0, right: 0};
    energMedC = {no_div: 0, left: 0, right: 0};
    rateEnergMedC = {without_div: 0, left: 0, right: 0};
    litterMedC = {without_div: 0, left: 0, right: 0};


    Herbivore.herbivores.forEach(herbivore => {
        // Sum the value of the variables for all herbivores
        popH[‘sem_div’]++
        velMedH[‘sem_div’] += herbivore.vel_max;
        forcaMedH[‘sem_div’] += herbivore.forca_max;
            radiusMedH[‘sem_div’] += herbivore.initial_radius * 1.5; // the maximum radius is (1.5 * initial_radius)
        radiusDetMedH[‘sem_div’] += herbivore.initial_detection_radius * 1.3; // 1.3 and not 1.5 because the detection radius increases less than the radius
        energMedH[‘sem_div’] += herbivore.energy_max_fix;
        rateEnergMedH[‘sem_div’] += herbivore.rate_energy_max;
        litterAverageH[‘no_div’] += (herbivore.litter_range[0] + herbivore.litter_range[1]) / 2;

        if(screenSplit){
            // Check if it's on the right or left
            let side;
            if(herbivore.position.x < universeWidth / 2) {
                side = ‘left’
            } else {
                side = ‘right’
            }
            // Sum the value of the variables for all herbivores
            popH[side]++
            velMedH[side] += herbivore.vel_max;
            forceMedH[side] += herbivore.force_max;
            radiusMedH[side] += herbivore.initial_radius * 1.5; // maximum radius is (1.5 * initial_radius)
            radiusDetMedH[side] += herbivore.initial_detection_radius * 1.3; // 1.3 and not 1.5 because the detection radius increases less than the radius
            energMedH[side] += herbivore.energy_max_fix;
            rateEnergMedH[side] += herbivore.rate_energy_max;
            litterMedH[side] += (herbivore.litter_range[0] + herbivore.litter_range[1]) / 2;
        }
    });

    Carnivoro.carnivoros.forEach(carnivoro => {
        // Sum the value of the variables for all carnivores
        popC[‘sem_div’]++
        velMedC[‘sem_div’] += carnivoro.vel_max;
        forceMedC[‘sem_div’] += carnivore.force_max;
        radiusMedC[‘sem_div’] += carnivore.radius_initial * 1.5; // maximum radius is (1.5 * radius_initial)
        radiusDetMedC[‘sem_div’] += carnivore.initial_detection_radius * 1.3; // 1.3 and not 1.5 because the detection radius increases less than the radius
        energMedC[‘sem_div’] += carnivoro.energia_max_fixa;
        rateEnergMedC[‘sem_div’] += carnivore.rate_energy_max;
        litterMedC[‘sem_div’] += (carnivore.litter_range[0] + carnivore.litter_range[1]) / 2;

        if(screenSplit){
            // Check if it's on the right or left
            let side;
            if(carnivore.position.x < universeWidth / 2) {
                side = ‘left’
            } else {
                side = ‘right’
            }
            // Sum the value of the variables for all carnivores
            popC[side]++
            velMedC[side] += carnivore.vel_max;
            forceMedC[side] += carnivore.force_max;
            radiusMedC[side] += carnivore.initial_radius * 1.5; // maximum radius is (1.5 * initial_radius)
            radiusDetMedC[side] += carnivore.initial_detection_radius * 1.3; // 1.3 and not 1.5 because the detection radius increases less than the radius
            energMedC[side] += carnivore.energy_max_fix;
            rateEnergMedC[side] += carnivore.rate_energy_max;
            litterMedC[side] += (carnivore.litter_range[0] + carnivore.litter_range[1]) / 2;
        }        
    });


    // Divide the value (the total sum) by the number of herbivores to get the average
    // Without division
    velMedH.sem_div /= popH.sem_div;
    forceMedH.sem_div /= popH.sem_div;
    radiusMedH.sem_div /= popH.sem_div;
    radiusDetMedH.sem_div /= popH.sem_div;
    energMedH.sem_div /= popH.sem_div;
    rateEnergMedH.sem_div /= popH.sem_div;
    ninhadaMediaH.sem_div /= popH.sem_div;
    // Left side
    velMedH.esq /= popH.esq;
    forceMedH.esq /= popH.esq;
    radiusMedH.esq /= popH.esq;
    radiusDetMedH.esq /= popH.esq;
    energMedH.esq /= popH.esq;
    rateEnergMedH.esq /= popH.esq;
    litterMedH.esq /= popH.esq;
    // Right side
    velMedH.dir /= popH.dir;
    forceMedH.dir /= popH.dir;
    radiusMedH.dir /= popH.dir;
    radiusDetMedH.dir /= popH.dir;
    energMedH.dir /= popH.dir;
    rateEnergMedH.dir /= popH.dir;
    litterAverageH.dir /= popH.dir;

    // Divide the value (the total sum) by the number of carnivores to get the average
    // Without division
    velMedC.sem_div /= popC.sem_div;
    forceMedC.sem_div /= popC.sem_div;
    radiusMedC.sem_div /= popC.sem_div;
    radiusDetMedC.sem_div /= popC.sem_div;
    energMedC.sem_div /= popC.sem_div;
    rateEnergMedC.sem_div /= popC.sem_div;
    litterMediaC.sem_div /= popC.sem_div;
    // Left side
    velMedC.esq /= popC.esq;
    forceMedC.esq /= popC.esq;
    radiusMedC.esq /= popC.esq;
    radiusDetMedC.esq /= popC.esq;
    energMedC.esq /= popC.esq;
    rateEnergMedC.esq /= popC.esq;
    litterMedC.esq /= popC.esq;
    // Right side
    velMedC.dir /= popC.dir;
    forceMedC.dir /= popC.dir;
    radiusMedC.dir /= popC.dir;
    radiusDetMedC.dir /= popC.dir;
    energMedC.dir /= popC.dir;
    rateEnergMedC.dir /= popC.dir;
    litterMedC.dir /= popC.dir;
}

function checkSplitPopulations(){
    if(screenSplit){
        right_side_empty = true;
        left_side_empty = true;
            
            
        Herbivore.herbivores.forEach(herbivore => {
            // Czech left side
            if(herbivore.position.x < universeWidth / 2 - 31){
                left_side_empty = false;
            }

            // Check right side
            if(herbivore.position.x > universeWidth / 2 + 31){
                right_side_empty = false;
            }
        })
    }
}

var idAnimate;

function pause(){
    paused = true;

    btnPause.classList.add(‘d-none’);
    btnPause.classList.remove(‘d-none’);

}

function unpause(){
    paused = false;

    btnPause.classList.add(‘d-none’);
    btnPause.classList.remove(‘d-none’);

    animate();
}

function accelerate(){
    animate();

    // btnDecelerate.classList.remove(‘d-none’);
}

function decelerate(){
    pause();
    setTimeout(despausa, 10);
}

function animate(){
    if(paused == false){
        idAnimate = requestAnimationFrame(animate);
    }
    
    c.clearRect(0, 0, universeWidth, universeHeight);
    c.beginPath();
    c.moveTo(-3, -4);
    c.lineTo(universeWidth + 3, -3);
    c.lineTo(universeWidth + 3, universeHeight + 3);
    c.lineTo(-3, universeHeight + 3);
    c.lineTo(-3, -3);
    c.strokeStyle = ‘white’;
    c.stroke();

    // Creating the Quadtree
    let qtree = new QuadTree(rectangleCanvas, 10);

    // Screen division
    if(checkbox_division.checked){
        screenSplit = true;
    } else{
        screenSplit = false;
    }

    if(screenDivided){
        drawDivision();

        Food.food.forEach((food, i) => {
            food.display();
            // remove food near the division to prevent organisms from being attracted to it
            if(food.position.x - universeWidth / 2 < 30 && food.position.x - universeWidth / 2 > -30){ 
                Food.food.splice(i, 1);
            }

            qtree.insertFood(food); // Insert the food into the QuadTree

        })

        if(loop_limiter < 10){
            loop_limiter++;
        }
        
        Organism.organisms.forEach((organism) => {
            if(organism.position.x <= universeWidth/2){ // if the organism is in the left part
                if(limit_of_loop == 1 && universeWidth/2 - organism.position.x < 10){ // push the organisms near the edge to the side
                    organism.position.x -= 10;
                }
                organism.createBorders(true); // screenSplit: true
            } else{ // if the organism is on the right
                if(limit_of_loop == 1 && organism.position.x - universeWidth/2 < 10){ // push organisms close to the edge to the side
                    organism.position.x += 10;
                }
                organism.createBorders(true); // screenSplit: true
            }
        })

        // Inserting the organisms into the QuadTree before calling their methods
        Herbivore.herbivores.forEach(herbivore => {
            qtree.insertHerbivore(herbivore); // Insert the herbivore into the QuadTree
        });
        Carnivore.carnivores.forEach(carnivore => {
            qtree.insertCarnivore(carnivore); // Insert carnivore into QuadTree
        });

        // Calling the organism's methods
        Herbivore.herbivores.forEach(herbivore => {
            herbivore.update();
            herbivore.wander();

            // Transforms the detection radius into a circle object so we can manipulate it
            let visaoH = new Circulo(herbivoro.posicao.x, herbivoro.posicao.y, herbivoro.raio_deteccao);
                
            // herbivore.fetchFood(qtree, visionH);
            if(herbivore.energy <= herbivore.energy_max * hunger_h){ // HUNGER
                herbivore.fetchFood(qtree, viewH);
            }
            herbivore.detectPredator(qtree, visionH);
        })

        Carnivore.carnivores.forEach(carnivore => {
            carnivore.update();
            carnivore.wander();

            // Transform the detection radius into a circle object so we can manipulate it
            let visaoC = new Circulo(carnivoro.posicao.x, carnivoro.posicao.y, carnivoro.raio_deteccao);

            // carnivoro.buscarHerbivoro(qtree, visaoC);
            if(carnivore.energy <= carnivore.energy_max * hunger_c){ // HUNGER
                carnivore.fetchHerbivore(qtree, viewC);
            }
        })
    } else{ // if the screen is NOT split
        loop_limiter = 0;

        Food.food.forEach(food => {
            food.display();
            qtree.insertFood(food); // Insert the food into the QuadTree

        })

        Organism.organisms.forEach((organism) => {
            organism.createBorders(false); // splitScreen: false
        })

        // Inserting the organisms into the QuadTree before calling their methods
        Herbivore.herbivores.forEach(herbivore => {
            qtree.insertHerbivore(herbivore); // Insert the herbivore into the QuadTree
             });
        Carnivoro.carnivoros.forEach(carnivoro => {
            qtree.insertCarnivoro(carnivoro); // Insert the carnivore into the QuadTree
        });
        
        // Calling the organism's methods
        Herbivore.herbivores.forEach(herbivore => {
            herbivore.update();
            herbivore.wander();
            
            // Transforms the detection radius into a circle object so we can manipulate it
            let visaoH = new Circulo(herbivoro.posicao.x, herbivoro.posicao.y, herbivoro.raio_deteccao);

            // herbivore.fetchFood(qtree, visionH);
            if(herbivore.energy <= herbivore.energy_max * hunger_h){ // HUNGER
                herbivore.fetchFood(qtree, viewH);
            }
            
            herbivore.detectPredator(qtree, visionH);
        })

        Carnivore.carnivores.forEach(carnivore => {
            carnivore.update();
            carnivore.wander();

            // Transform the detection radius into a circle object so we can manipulate it
            let visaoC = new Circulo(carnivoro.posicao.x, carnivoro.posicao.y, carnivoro.raio_deteccao);

            // carnivoro.buscarHerbivoro(qtree, visaoC);
            if(carnivore.energy <= carnivore.energy_max * hunger_c){ // HUNGER
                carnivore.fetchHerbivore(qtree, viewC);
            }
        })
    }
}

function generateInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
// ----------------------------------------------------------------------------------------------
// Dynamic Panels and Popovers
// ----------------------------------------------------------------------------------------------
// Function linked to the click event to find the organism in the list and return its properties
function getOrganism(x, y) {
    let organism = Organism.organisms.find(o => Math.abs(o.position.x - x) <= 10 && Math.abs(o.position.y - y) <= 10)
    if(organism == undefined) {
        return; //console.log(‘not found’)
    }

    // Check if a popover for the clicked organism already exists
    let popoverJaExiste = document.querySelectorAll(`.popover-info[data-organismoid=‘${organismo.id}’]`).length > 0 ? 1:0
    if (popoverJaExiste) {
        return;
    }
    
