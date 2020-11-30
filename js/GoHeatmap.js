
/**
 * Constructor for the a GoHeatmap
 *
 */
function GoHeatmap(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
GoHeatmap.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divGoHeatmap = d3.select(".go-heatmap").classed("content", true);
    self.svgBounds = divGoHeatmap.node().getBoundingClientRect();
    console.log(self.svgBounds)
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 250;

    //creates svg element within the div
    self.svg = divGoHeatmap.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        // Build X scales and axis:
    self.x = d3.scaleBand()
      .range([ 0, self.svgWidth ])
      .padding(0.01);

    // Build X scales and axis:
    self.y = d3.scaleBand()
      .range([ self.svgHeight, 0 ])
      .padding(0.01);

    // Build color scale
    self.myColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1,100])

};

GoHeatmap.prototype.receiveData = function(gene_list, go_data){

  var self = this;

  self.gProfilerConvert(sessionStorage.getItem("organism_code"), gene_list, "GO", go_data)

};

GoHeatmap.prototype.gProfilerConvert = function(organism, gene_list, target, go_data){
  var self = this;
  // remove null items from list (this occurs when the genes are filtered on score threshold -- maybe do this in network instead?)
  // cite: https://stackoverflow.com/a/281335
  var cleanArray = gene_list.filter(function () { return true });

    $.ajax({
      type: "POST",
      url: "https://biit.cs.ut.ee/gprofiler/api/convert/convert/",
      data: '{"organism": "'+organism+'", "target": "'+target+'", "query": '+'["'+cleanArray.join('","')+'"]}',
      headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
    }).done(function( data ) {
      self.setData(JSON.parse(data).result, go_data);
    });

}; // end gProfilerConvert()

/**
 *
 * @param
 * @param
 */

GoHeatmap.prototype.setData = function(gene_to_go_json, go_data){
    var self = this;

    var go_dict = {};
    gene_to_go_json.forEach((item, i) => {
      if(item.converted in go_dict){
        go_dict[item.converted].push(item.incoming)
      }else{
        go_dict[item.converted] = [item.incoming]
      }
    }); // end forEach
    console.log(go_dict)


    self.go_by_gene_data = {"GO:BP": {gene_list:[], go_term_list:[], edge_list:[]},
                            "GO:CC":{gene_list:[], go_term_list:[], edge_list:[]},
                            "GO:MF":{gene_list:[], go_term_list:[], edge_list:[]},
                            "KEGG":{gene_list:[], go_term_list:[], edge_list:[]}};

    go_data.forEach((item, i) => {
      //functional_category = item.source (doesn't work to assign this to a variable and then select from go_By_gene_data...dont know why)
      //go_term = item.native (see above)

      // append go term to correct item.source go_term_list (if doesn't already exist)
      if(!(item.native in self.go_by_gene_data[item.source].go_term_list)){
          self.go_by_gene_data[item.source].go_term_list.push(item.native);
      }

      if(item.native in go_dict){
        // append genes associated with this go term to gene_list (if they don't already exist in the list)
        // cite: https://stackoverflow.com/a/34902391
        var filtered_genes = go_dict[item.native].filter(
              function(e) {
                return this.indexOf(e) < 0;
              },
              self.go_by_gene_data[item.source].gene_list
            );
        if(filtered_genes.length > 0){
              self.go_by_gene_data[item.source].gene_list.push(filtered_genes);
        }
        // fill edge_list
          go_dict[item.native].forEach((gene_id, index) => {
            self.go_by_gene_data[item.source].edge_list.push({gene: gene_id, go: item.native, score:100})
          });

      } // end if(item.native in go_dict)

    }); // end go_data.forEach

}; // end setData()


/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param go_category is passed in GoNetwork. it is passed when a label on the x-axis is clicked
 */

GoHeatmap.prototype.update = function(go_category){ // TODO: ENTER/UPDATE/EXIT OR OTHERWISE CLEAR OLD MAP PRIOR TO UPDATING
    var self = this;

    self.y.domain(self.go_by_gene_data[go_category]["gene_list"].flat());

    self.svg.append("g").call(d3.axisLeft(self.y));

    self.x.domain(self.go_by_gene_data[go_category]["go_term_list"].flat())

    self.svg.append("g")
      .attr("transform", "translate(0," + self.svgHeight + ")")
      .call(d3.axisBottom(self.x))

    self.svg.selectAll()
            .data(self.go_by_gene_data[go_category]["edge_list"], function(d) {return d.gene+':'+d.go;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return self.x(d.gene) })
            .attr("y", function(d) { return self.y(d.go) })
            .attr("width", self.x.bandwidth() )
            .attr("height", self.y.bandwidth() )
            .style("fill", function(d) { return self.myColor(d.score)} )

};
