/*
CPSC 583 - Fall 2019                                                                                  Jeremy Sutherland
10/26/19                                                                                                       10162263
 */

window.onload = function(){
    setup();
};
// The constants for our margins
const MARGINS = {top: 80, right: 160, bottom: 30, left: 80};

    // Our visualization global variable
var _vis;

var StackedBarPlot = function(){

    // The datapool, width and height of the visualization
    this.data;
    this.width = 1000;
    this.height = 600;

    // The SVG element our visualization is bound to, as where the data for our bars will go
    this.svgContainer;
    this.datapoints;

    // The x, y and color scales
    this.xAxisScale;
    this.yAxisScale;
    this.colorScale;

    this.setupScales = function(xRange, yRange){

        // Setting up a categorized scale for our pokemon types
        this.xAxisScale = d3.scaleBand()
            .domain(this.data.map(function(d){return d.Type;}))
            .range(xRange)
            .paddingInner(0.2)
            .paddingOuter(0.2);

        // Setting up the straightforward quantitative scale for the pokemon statistics
        this.yAxisScale = d3.scaleLinear()
        //Sets the graph to only be as high a nice rounded up value close to the size of the highest stack
            .domain([0, d3.max(this.data, function(d){return (d["HP"] + d["Attack"] + d["Defense"]
             + d["SpAttack"] + d["SpDefense"] + d["Speed"]);})]).nice()     //Sets the graph to only be as high
            .range(yRange);

        // Setting up the color scale that we'll use to color each section of the stack
        this.colorScale = d3.scaleOrdinal()
            .range(["green", "red", "turquoise", "maroon", "blue", "pink"]);

    };

    this.setupAxis = function() {

        // This sets up the x axis for the graph using our scales
        this.xAxis = d3.axisBottom(this.xAxisScale);

        // This sets up the y axis for the graph, as well as the ticks to help see the results clearly
        this.yAxis = d3.axisLeft(this.yAxisScale)
            .tickSize(-this.width + MARGINS.left*3)
            .ticks(10)
            .tickPadding(10);

        // This calls the x and y axes into the <g> elements  so they can be drawn on the webpage
        this.svgContainer.append("g")
            .attr("transform", `translate(0, ${this.height - MARGINS.bottom })`)
            .call(this.xAxis);
        this.svgContainer.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .call(this.yAxis);

        // This whole section is just adding labels  and counts for the x and y axes
        this.svgContainer.append("text")
            .attr("x", (MARGINS.left)/2)
            .attr("y", (this.height)/2)
            .attr("transform", `rotate(-90, ${MARGINS.left / 3}, ${this.height/2})`)
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("opacity", "1")
            .text("HP / Attack / Defense");
        this.svgContainer.append("text")
            .attr("x", (this.width)/2 - 40)
            .attr("y", (MARGINS.top)/2)
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .text("Type");

    };


    this.createBars = function(){

        // Here, we create a stack structure which will allow us to easily draw the stacked bars
        var statlayer = d3.stack()
            .keys(["HP", "Attack", "Defense", "SpAttack", "SpDefense", "Speed"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffSetNone);

        // Here is where the data actually gets put into the stack structure.
        var stats = statlayer(this.data);

        // Here we create another data structure for just the actual statistic headers, which we need to do
        // in order to cleanly color the stacks, as well as create the legend later
        keys = d3.keys(this.data[0]).slice(1);

        //We then use this key set to finish setting up the color scale
        _vis.colorScale.domain(keys);

        // Here is where the bar actually gets drawn
        this.svgContainer.append("g")
            .selectAll("g")
            .data(stats)
            .enter()                        // By this point loaded our data into another group <g></g>
            .append("g")
            .attr("fill", function(d) {return _vis.colorScale(d[0]);}) //Here, we set the color each level of the stack
            .selectAll("rect")                                         // now, so when the stacks are drawn they're
            .data(function(d){return d;})                              // already filled in with the desired color
            .enter()

                                    // Here is where we actually draw our bars. Each stack level gets drawn together
                                    // before it moves onto the next layer
            .append("rect")
            .attr("x", function(d) {return _vis.xAxisScale(d.data["Type"])})
            .attr("y", function(d) {return _vis.yAxisScale(d[1]);})
            .attr("width", _vis.xAxisScale.bandwidth())
            .attr("height", function(d) {return _vis.yAxisScale(d[0]) - _vis.yAxisScale(d[1]);})
            .append("svg:title")                            // Finally we add a label which displays the statistic
            .text(function(d){return (d[1]-d[0]);});        // value  for a stack when you hover the mouse over it

    };

    this.createLegend = function () {

        // Here we finally draw the legend for the color scale
        var legend = this.svgContainer.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)                      //First we set up text formatting, such as alignment
            .attr("text-anchor", "start")
            .selectAll("g")                             // We select a new <g></g> element to contain our legend

            // Here, we use our key structure, since we only need the titles of each statistic (column) for our legend.
            // It needs to be flipped first though
            .data(keys.slice().reverse())
            .enter().append("g")       // Here we enter a new g group and mark where the legend elements will be drawn
            .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });

        // This is where we just draw the legend color boxes according to where our g elements have their locations
        // stored. The boxes are then colored in accordingly
        legend.append("rect")
            .attr("x", _vis.width - MARGINS.left*2 + 19 )
            .attr("y", MARGINS.top)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", _vis.colorScale);

        // Finally, we  insert our text labels for the legend
        legend.append("text")
            .attr("x", _vis.width - MARGINS.left - 24)
            .attr("y", MARGINS.top + 7)
            .attr("dy", "0.35em")
            .text(function(d) { return d; });

        this.svgContainer.append("text")
            .attr("x", _vis.width - MARGINS.left - 24)
            .attr("y", (MARGINS.top)/2 + 25)
            .style("text-anchor", "middle")
            .text("Statistics");


    }

};

//Initializing the structure for our visualization object

function setup(){
    _vis = new StackedBarPlot();                // initializing the object and it's default values
    _vis.svgContainer = d3.select("#vis");      // binding the visualization to the SVG element in the HTML page
    // dynamically changing the height and width of the visualization to fit the browser window
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().width :
        _vis.width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().height :
        _vis.height;

    //starting the process of loading the dataset into the vizualization
    loadData("Pokemonv2.csv");
}

function loadData(path){
    // loading the data from the csv file into the global _data variable
    d3.csv(path).then(function(data){

        // This converts out data into a subset that I want to work with, as well as formats it to suit my needs.
        // It creates a nest structure that groups together all the pokemon of the same type, as well as finding
        // the mean values of every statistic per pokemon type

        var averageByType = d3.nest()
            .key(function(d){return d["Type 1"]})
            .rollup(function(v) {return {
                Type: v[0]["Type 1"],
                HP: d3.mean(v, function(d){return d["HP"]}),
                Attack: d3.mean(v, function(d){return d["Attack"]}),
                Defense: d3.mean(v, function(d){return d["Defense"]}),
                SpAttack: d3.mean(v, function(d){return d["Sp. Atk"]}),
                SpDefense: d3.mean(v, function(d){return d["Sp. Def"]}),
                Speed: d3.mean(v, function(d){return d["Speed"]})};})
            .entries(data);

        // This essentially flattens the nested structure so that we're actually able to access the key (type)
        // as well as the other statistics.
        var stats = d3.values(d3.values(averageByType, function(d){return d.key})).map(function(d) {return d.value});
        _vis.data = stats;          // Setting the flattened nest as the datapool for the visualization
                                    // Setting up the scales
        _vis.setupScales([MARGINS.left, _vis.width - MARGINS.right], [_vis.height - MARGINS.bottom, MARGINS.top]);
        _vis.setupAxis();           // Drawing our axes
        _vis.createBars();          // Drawing the actual bars
        _vis.createLegend();        // Drawing a legend for our color scale

    });

}