function Network(){

    var self = this;
    self.init();
};

Network.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divNetwork = d3.select("#network-vis").classed("content", true);
    self.svgBounds = divNetwork.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divNetwork.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

Network.prototype.update = function(data){
    var self = this;
    console.log(data)

}