
/**
 * Constructor for the a GoHeatmap
 */

 // <h2 class="content-heading">Gene By Functional Category
 //     <a id="gene-by-function-help" data-toggle="modal" data-target="#geneByFunctionalModal"><span data-feather="help-circle" class="help"></span></a>
 // </h2>

function GoHeatmap(networkDetail){
    var self = this;
    //self.colorScheme = colorScheme;
    self.networkDetail = networkDetail;
    self.init();
}; // end constructor

/**
 * Initializes the svg elements required for this chart
 */
GoHeatmap.prototype.init = function(){
    var self = this;
    self.margin = {top: 100, right: 100, bottom: 30, left: 100};

}; // end init()

GoHeatmap.prototype.appendPlot = function(go_category){
  var self = this;
  //TOD0: APPEND FUNCTIONAL CATEGORY AS SUBTITLE
  console.log(go_category)
  console.log(self.networkDetail.axis_selection)
  console.log(go_category == "" && typeof self.networkDetail.axis_selection == "undefined")

  try{
    if(go_category == "" && typeof self.networkDetail.axis_selection == "undefined"){
        throw "Click one of the functional categories which label the horizontal axis of the Manhatten Plot"
    } else{ // end try statement
        if (go_category ==""){
          go_category = self.networkDetail.axis_selection;
        }
        // heading for gomanhatten plot
         var content_heading = '<h2 class="content-heading">Gene By Functional Term<a id="gene-by-function-help" data-toggle="modal" data-target="#geneByFunctionalModal">\
                                <span data-feather="help-circle" class="help"></span></a>\
                                </h2>'
        $("#plot-error").empty()
        $("#plot-title").attr("class", "col-lg-10")
        $("#plot-title").find("h2").text("Gene By Functional Term")
        $("#plot-subtitle").text("")
        $("#plot-help").attr("data-toggle", "modal")
        $("#plot-help").attr("data-target", "#geneByFunctionalModal")

        // empty the plot div
        $("#plot-div").empty();

        // switch the Gene Detail/Go Detail tab
        $("#manhatten-plot-selector").removeClass('active');
        $("#heatmap-plot-selector").addClass('active');


        //Gets access to the div element created for this chart from HTML
        var divGoHeatmap = d3.select("#plot-div").classed("content", true);
        self.svgBounds = divGoHeatmap.node().getBoundingClientRect();
        self.svgWidth = self.svgBounds.width;
        self.svgHeight = 1000; // TODO: SOMEHOW, THIS NEEDS TO BE UPDATED WITH THE NUMBER OF GENES TO DISPLAY (maybe bins? 1-20 some length, 20-40 some length, etc)
        //TODO: DYNAMICALLY SIZE HEATMAP BASED ON INPUT SIZE
        //creates svg element within the div
        self.svg = divGoHeatmap.append("svg")
            .attr("width",self.svgWidth)
            .attr("height",self.svgHeight+self.svgBounds.top)
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        // Build X scales and axis:
        self.x = d3.scaleBand()
          .range([ 0, self.svgWidth-self.margin.left-self.margin.right ])
          .padding(0.01);

        // Build X scales and axis:
        self.y = d3.scaleBand()
          .range([ self.svgHeight-self.svgBounds.top, 0 ])
          .padding(0.01);

        // Build color scale
        self.myColor = d3.scaleLinear()
          .range(["white", "#69b3a2"])
          .domain([1,100])

        self.update(go_category);
      }
  } catch(err){
    console.error(err);
    // empty the plot div
    $("#plot-heading-div").empty();
    $("#plot-div").empty();
    $("#plot-error").append('<h4>'+err+'</h4>');
  }
}

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param go_category is passed in GoManhattenPlot. it is passed when a label on the x-axis is clicked
 */

GoHeatmap.prototype.update = function(go_category){ // TODO: ENTER/UPDATE/EXIT OR OTHERWISE CLEAR OLD MAP PRIOR TO UPDATING
    var self = this;
    console.log(go_category)

    try{
      if (self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat().length == 0){
        throw "No significant GO terms in category: "+go_category + ". Try one of the other functional categories"
      } else{
        console.log(self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat())

        // update the y domain with the gene list
        self.y.domain(self.networkDetail.go_by_gene_data[go_category]["gene_list"].flat());
        // append the y axis to the svg element
        self.svg.append("g")
                .call(d3.axisLeft(self.y))
                .attr("class", "heatmap-update");

        // update the x axis with the go terms
        self.x.domain(self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat());
        // add the x axis to the svg element

        self.svg.append("g")
                //.attr("transform", "translate(0," + self.svgHeight + ")")
                .call(d3.axisTop(self.x))
                .attr("class", "heatmap-update")
                .attr("id", "heatmap-x-axis")
                .selectAll("text")
                .attr("y", 0)
                .attr("x", -70)
                .attr("dy", "-.35em")
                .attr("transform", "rotate(45)")
                .style("text-anchor", "start")
                .on("click", function(d,i){
                  //this extracts the axis label, eg GO:BP, from a click on the xaxis of the GO plot
                  var axis_selection = d.srcElement.innerHTML;
                  self.networkDetail.updateGoDetail(self.networkDetail.go_by_gene_data[go_category].go_dict[axis_selection])
                  // remove any previous coloring
                  d3.select("#network-vis").selectAll(".node")
                                           .attr("fill", function (d) {
                                               if (d.type == "tf") {
                                                   return self.networkDetail.colorScheme("tf");
                                               }
                                               else {
                                                   return self.networkDetail.colorScheme("gene");
                                               }
                                           })
                  //color nodes by GO category
                  $("#network-vis").find(".node").each((index,node) => {
                      if (self.networkDetail.go_by_gene_data[go_category].go_dict[axis_selection].gene_list.includes(node.id)){
                          d3.selectAll("#"+node.id).attr("fill", self.networkDetail.colorScheme(go_category));
                      }
                  });
                });

        // add blocks to heatmap
        self.svg.selectAll("rect")
                .data(self.networkDetail.go_by_gene_data[go_category]["edge_list"], function(d) {return d.gene+':'+d.go;})
                .enter()
                .append("rect")
                .attr("class", "heatmap-update")
                .attr("x", function(d) { return self.x(d.go) })
                .attr("y", function(d) { return self.y(d.gene) })
                .attr("width", self.x.bandwidth() )
                .attr("height", self.y.bandwidth() )
                .style("fill", self.networkDetail.colorScheme(go_category) );

      } // end else statement inside of try
    } catch(err){
      // clear graph and old notices
      $("#plot-div").empty()
      $("#plot-error").empty()
      // print the notice
      $("#plot-error").append('<h4>'+err+'</h4>');

    } // end try .. catch

}; // end update()
