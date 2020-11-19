
/**
 * Constructor for the edgeWeightDistribution
 *
 *
 */
function edgeWeightDistribution(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
edgeWeightDistribution.prototype.init = function(){
    var self = this;
    this.organism = organism;


    // self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    //
    // //Gets access to the div element created for this chart from HTML
    // var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    // self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    // self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    // self.svgHeight = 150;
    //
    // //creates svg element within the div
    // self.svg = divVisTemplate.append("svg")
    //     .attr("width",self.svgWidth)
    //     .attr("height",self.svgHeight)
};



/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

edgeWeightDistribution.prototype.update = function(){
    var self = this;


};

// window.onload=function(){

//     document.getElementById("fly-button").addEventListener("click", function() {
//         console.log("Fly was selected");
//         $('#fly-button').css('border', 'solid 5px #007bff');
//         $('#yeast-button').css('border', 'solid 3px black');
//         $('#human-button').css('border', 'solid 3px black');
//     });

//     document.getElementById("yeast-button").addEventListener("click", function() {
//         console.log("Yeast was selected");
//         $('#fly-button').css('border', 'solid 3px black');
//         $('#yeast-button').css('border', 'solid 5px #007bff');
//         $('#human-button').css('border', 'solid 3px black');
//     });

//     document.getElementById("human-button").addEventListener("click", function() {
//         console.log("Human was selected");
//         $('#fly-button').css('border', 'solid 3px black');
//         $('#yeast-button').css('border', 'solid 3px black');
//         $('#human-button').css('border', 'solid 5px #007bff');
//     });
// }
