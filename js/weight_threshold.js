function Weights(){

    var self = this;
    self.init();
};

Weights.prototype.init = function(){
    var self = this;
    // self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divWeights = d3.select("#weights").classed("content", true);
    self.svgBounds = divWeights.node().getBoundingClientRect();
    // self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgWidth = 500;
    self.svgHeight = 200;
    self.padding = 30;

    //creates svg element within the div
    self.svg = divWeights.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    var dataArray = self.createNormalDist(0, 15);

    var xScale = d3.scaleLinear()
            .range([0,  self.svgWidth-self.padding])
            .domain([d3.min(dataArray, function (d) { return d.x; }), d3.max(dataArray, function (d) { return d.x })]);

    var yScale = d3.scaleLinear()
        .range([self.svgHeight-self.padding, 0])
        .domain([0, d3.max(dataArray, function(d) {
            return d.y;
        })]);

    var line = d3.line()
        .x(function(d) {
            return xScale(d.x);
        })
        .y(function(d) {
            return yScale(d.y);
        });

    self.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(5," + (self.svgHeight-30) + ")");

    self.g = self.svg.append("g")
        .attr("id", "weight-g");

    self.g.append("path")
        .datum(dataArray)
        .attr("d", line)
        .style("fill", "rgb(103, 120, 208)")
        .style("opacity", "1");

    self.svg.select(".x-axis").call(d3.axisBottom(xScale));

    // Create brush component
    var brush = d3.brushX()
        .extent([[0, 0], [self.svgWidth-self.padding, self.svgHeight-self.padding]])
        .on("brush", self.brushed);

      // Append brush component
    self.svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", self.svgHeight + 7);


};

Weights.prototype.createNormalDist = function(mean, std) {
    let data = [];
    let minI = mean - 4 * std;
    let maxI = mean + 4 * std;
    for (var i = minI; i < maxI; i += 1) {
        data.push({
            "x": i,
            "y": Math.exp((-0.5) * Math.pow((i - mean) / std, 2))
        });
    };
    return data;
};

Weights.prototype.brushed = function({selection}) {
    console.log(selection);

}