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

    //creates svg element within the div
    self.svg = divWeights.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};