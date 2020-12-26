
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

    self.functional_category_html_buttons = '<div class="btn-group btn-group-toggle" data-toggle="buttons" style="margin-left:10px; margin-top:10px">\
                                               <label class="btn active" style="background-color: #751A33; color:white; text-aling=center;">\
                                                 <input type="radio" name="options" id="option1" autocomplete="off" checked> GO:Biological Processes\
                                               </label>\
                                               <label class="btn" style="background-color: #D28F33; color:white; text-aling=center;>\
                                                 <input type="radio" name="options" id="option2" autocomplete="off"> GO:Cellular Processes\
                                               </label>\
                                               <label class="btn" style="background-color: #B34233; color:white; text-aling=center;>\
                                                 <input type="radio" name="options" id="option3" autocomplete="off"> GO:Molecular Functions\
                                               </label>\
                                               <label class="btn" style="background-color: #88867D; color:white; text-aling=center;>\
                                                 <input type="radio" name="options" id="option4" autocomplete="off"> KEGG\
                                               </label>\
                                            </div>'

}; // end init()

GoHeatmap.prototype.appendPlot = function(go_category){
  var self = this;
  //TOD0: APPEND FUNCTIONAL CATEGORY AS SUBTITLE

  try{
    if(go_category == "" && typeof self.networkDetail.axis_selection == "undefined"){
        throw "Click one of the functional categories which label the horizontal axis of the Manhatten Plot"
    } else{ // end try statement
        if (go_category ==""){
          go_category = self.networkDetail.axis_selection;
        }

        // heading for heatmap
        $("#plot-error").empty();
        $("#go-buttons").empty();
        //$("#plot-title").find("h2").text("Gene By Functional Term")
        $("#plot-subtitle").text("");
        $("#go-buttons").append(self.functional_category_html_buttons);
        $("#plot-help").attr("data-toggle", "modal");
        $("#plot-help").attr("data-target", "#geneByFunctionalModal");

        // empty the plot div
        $("#plot-div").empty();

        // switch the Gene Detail/Go Detail tab
        $("#manhatten-plot-selector").removeClass('active');
        $("#heatmap-plot-selector").addClass('active');


        //Gets access to the div element created for this chart from HTML
        var divGoHeatmap = d3.select("#plot-div").classed("content", true);
        self.svgBounds = divGoHeatmap.node().getBoundingClientRect();

        // get number of genes, set height as multiple of this, if go_by_gene_data is populated
        try{
          var responsiveSvgHeight = 0
          var responsiveSvgWidth = 0
          var num_genes = [...new Set(self.networkDetail.go_by_gene_data[go_category]["gene_list"].flat())].length
          var num_go_terms = [...new Set(self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat())].length

          if (num_genes == 0) throw "no genes in list"
          if (num_go_terms == 0) throw "no go_terms in list"
          if(num_genes>30){
            responsiveSvgHeight = num_genes*10
          } else if (num_genes > 20){
            responsiveSvgHeight = num_genes*12
          } else if (num_genes > 10){
            responsiveSvgHeight = num_genes*20
          } else {
            responsiveSvgHeight = num_genes*70
          }


          if(num_go_terms > 15){
             responsiveSvgWidth = num_go_terms * 13
          } else if(num_go_terms>10){
              responsiveSvgWidth = num_go_terms * 25
          } else if(num_go_terms > 5){
              responsiveSvgWidth = num_go_terms * 50
          } else{
              responsiveSvgWidth = num_go_terms * 100
          }
        } catch(err){
          responsiveSvgWidth = self.svgBounds.width;
          responsiveSvgHeight = 800;
        }

        //creates svg element within the div
        self.svg = divGoHeatmap.append("svg")
            .attr("width", self.svgBounds.width-self.margin.left)
            .attr("height",responsiveSvgHeight+self.svgBounds.top)
            .append("g")
            //.style('transform', 'translate(30%, 50%)')
            .attr("transform", "translate(" + self.margin.left + "," + (self.margin.top) + ")");

        // Build X scales and axis:
        self.x = d3.scaleBand()
          .range([ 0, responsiveSvgWidth])
          .padding(0.01);

        // Build X scales and axis:
        self.y = d3.scaleBand()
          .range([ responsiveSvgHeight, 0 ])
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
    $("#plot-title").find("h2").text("")
    $("#plot-subtitle").text("")
    $("#go-buttons").empty()
    $("#plot-error").empty()

    $("#plot-div").empty();
    $("#plot-help").attr("data-toggle", "modal")
    $("#plot-help").attr("data-target", "#geneByFunctionalModal")
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

    try{
      if (self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat().length == 0){
        throw "No significant GO terms in category: "+go_category + ". Try one of the other functional categories"
      } else{
        // update the y domain with the gene list
        self.y.domain(self.networkDetail.go_by_gene_data[go_category]["gene_list"].flat());
        // append the y axis to the svg element
        self.svg.append("g")
                .call(d3.axisLeft(self.y))
                .attr("class", "heatmap-update")
                .selectAll('text')
                .on('mouseover', function(d,i){

                  d3.select(this)
                    .classed('manhatten-plot-inactive', false)
                    .classed('manhatten-plot-active', true)
                    .attr("fill", self.networkDetail.colorScheme(go_category))
                    //.style("text-shadow", "0px 0px 50px"+self.networkDetail.colorScheme(go_category))
                    .style("cursor", "pointer");
                })
                .on('mouseout', function(d,i){
                  d3.select(this)
                    .classed('manhatten-plot-active', false)
                    .classed('manhatten-plot-inactive', true)
                    .style("cursor", "default");
                });

        // update the x axis with the go terms
        self.x.domain(self.networkDetail.go_by_gene_data[go_category]["go_term_list"].flat());
        // add the x axis to the svg element

        self.svg.append("g")
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
                })
                .on('mouseover', function(d,i){
                    var label = d3.select(this)
                    console.log(d3.select(this))
                    d3.select(this)
                      .classed('manhatten-plot-inactive', false) // rename this css property
                      .classed('manhatten-plot-active', true)
                      .attr("fill", self.networkDetail.colorScheme(go_category))
                      .style("cursor", "pointer");

                  })
                  .on('mouseout', function(d,i){
                    d3.select(this)
                      .classed('manhatten-plot-active', false)
                      .classed('manhatten-plot-inactive', true)
                      .style("cursor", "default");
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
      $("#plot-title").find("h2").text("");
      $("#plot-subtitle").text("");
      $("#plot-error").empty();
      $("#plot-div").empty();
      $("#go-buttons").empty();
      $("#plot-help").attr("data-toggle", "modal");
      $("#plot-help").attr("data-target", "#geneByFunctionalModal");
      // print the notice
      $("#plot-error").append('<h4>'+err+'</h4>');

    } // end try .. catch

}; // end update()
