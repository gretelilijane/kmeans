const simulationPlot = document.getElementById('simulation-plot');
const gaussianMeanInput = document.querySelector('#gaussian-mean');
const gaussianVarianceInput = document.querySelector('#gaussian-variance');
const setParametersButton = document.querySelector('#set-parameters');
const findClustersButton = document.querySelector('#find-clusters');


let gaussianMean = gaussianMeanInput.value;
let gaussianVariance = gaussianVarianceInput.value;
let numberOfCentroids = document.querySelector('#number-of-centroids').value;
let data = [];
let clusters = [];
let numberOfClusters = 0;

const markers = ['diamond', 'circle', 'triangle-up', 'square'];
const colors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];
let centroids = [];

gaussianMeanInput.addEventListener('input', () => {
    gaussianMean = parseFloat(gaussianMeanInput.value);
});

gaussianVarianceInput.addEventListener('input', () => {
    gaussianVariance = parseFloat(gaussianVarianceInput.value);
});

setParametersButton.addEventListener('click', () => {
    if (++numberOfClusters < 5){
        data.push(setParameters());
        //if (data.includes())
        plotClusters();
    } else {
        data = [];
        numberOfClusters = 0;
    }
});

findClustersButton.addEventListener('click', () => {
    if (numberOfClusters > 0){
       kMeans();
    } 
});

function setParameters(numberOfPoints = 16) {
    let data = {
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Grupp ' + (numberOfClusters),
        marker: { 
            size: 12,
            color: 'rgb(0, 0, 0)',
            symbol: markers[numberOfClusters]
         }
    }

    for(let i = 0; i < numberOfPoints; ++i) {
        data.x.push(Math.randomGaussian());
        data.y.push(Math.randomGaussian());
    }
    
    return data;
}


Math.randomGaussian = function(mean, standardDeviation) {

    mean = gaussianMean;
    standardDeviation = gaussianVariance;

    if (Math.randomGaussian.nextGaussian !== undefined) {
        var nextGaussian = Math.randomGaussian.nextGaussian;
        delete Math.randomGaussian.nextGaussian;
        return (nextGaussian * standardDeviation) + mean;
    } else {
        var v1, v2, s, multiplier;
        do {
            v1 = 2 * Math.random() - 1; // between -1 and 1
            v2 = 2 * Math.random() - 1; // between -1 and 1
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        multiplier = Math.sqrt(-2 * Math.log(s) / s);
        Math.randomGaussian.nextGaussian = v2 * multiplier;
        return (v1 * multiplier * standardDeviation) + mean;
    }
};


function plotClusters() {
    var layout = {
        title:'kMeans ehk kuidas võita valimisi',
        xaxis: {
            title: 'Rohelisus',
            range: [0, 10]
        },
        yaxis: {
            title: 'Innovaatilisus',
            range: [0, 10]
        }
    };
    
    Plotly.newPlot(simulationPlot, data, layout);  
}

// kMeans

function kMeans() {
    if (centroids.length == 0) {
        console.log('Heips');
        // Initialize centroids
        for (let i = 0; i < numberOfCentroids; ++i) {
            gaussianMean = 10*Math.random();
            gaussianVariance = Math.random();
            centroids.push({
                x: [Math.randomGaussian()],
                y: [Math.randomGaussian()],
                mode: 'markers',
                type: 'scatter',
                name: 'Raskuskese ' + (i + 1),
                marker: { 
                    size: 12,
                    color: colors[i],
                    symbol: 'x-dot'
                 }
            });
        }
        data = data.concat(centroids);  // TODO: Remove previous centroids!
        return plotClusters();   
    } 

    // Make new traces
    let traces = {};

    for (let i = 0; i < numberOfCentroids; ++i) {
        let color = colors[i];
        traces[color] = {};

        for (let symbol of markers) {
            traces[color][symbol] = {
                x: [],
                y: [],
                mode: 'markers',
                type: 'scatter',
                name: 'Grupp ',
                marker: { 
                    size: 12,
                    color: color,
                    symbol: symbol
                 }
            };
        }
    }

    // Find closest centroid
    for (let points of data) {
        if (points.marker.symbol !== 'x-dot') {
            for (let i = 0; i < points.x.length; ++i) {
                let closestCentroidColor;
                let closestCentroidDist = 100000;
                for (let centroid of centroids) {
                    let dist = Math.pow(centroid.x[0] - points.x[i], 2) + 
                    Math.pow(centroid.y[0] - points.y[i], 2)
                    if ( dist < closestCentroidDist) {
                        closestCentroidDist = dist;
                        closestCentroidColor = centroid.marker.color;
                    }
                }

                traces[closestCentroidColor][points.marker.symbol].x.push(points.x[i]);
                traces[closestCentroidColor][points.marker.symbol].y.push(points.y[i]);
            }
        }
    }

    data = [];
    
    for (let colorTraces of Object.values(traces)) {
        data = data.concat(Object.values(colorTraces));
    }

    data = data.concat(centroids);

    plotClusters();

    // Calculate new centroids
    centroids = [];
    
    for (let i = 0; i < numberOfCentroids; ++i) {
        let color = colors[i];
        let x = [];
        let y = [];

        if (color in traces) {
            for (let trace of Object.values(traces[color])) {
                x = x.concat(trace.x);
                y = y.concat(trace.y);
            }
        }

        centroids.push({
            x: x.length ? [x.reduce((a, b) => a + parseFloat(b), 0) / x.length] : [Math.random()*10],
            y: y.length ? [y.reduce((a, b) => a + parseFloat(b), 0) / y.length] : [Math.random()*10],
            mode: 'markers',
            type: 'scatter',
            name: 'Raskuskese',
            marker: { 
                size: 12,
                color,
                symbol: 'x-dot'
             }
        });
    }
}
