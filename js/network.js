function Network(){

    var self = this;
    self.init();
};

Network.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divNetwork = d3.select(".network-vis").classed("content", true);
    self.svgBounds = divNetwork.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300;

    //creates svg element within the div
    self.svg = divNetwork.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

Network.prototype.update = function(data, organism){
    var self = this;
    var svg = self.svg;
    if(organism == "fly"){
        var dataDir = "data/fruitfly/tf_to_target/"
    }; 

    var dataDir = "data/fruitfly/tf_to_target/"
    console.log("here")
    d3.json(dataDir+"FBgn0000014"+".json",function(tf){
        console.log(tf)
         // DEFINE 'NODES' AND 'EDGES'

        //  var links = data.links.map(d => Object.create(d));
        //  var nodes = data.nodes.map(d => Object.create(d));
 
        //  console.log("here"+ links)
        //  // START RUNNING THE SIMULATION
        //  var simulation = d3.forceSimulation(nodes)
        //      .force('link', d3.forceLink(links).distance(40))
        //      .force("center", d3.forceCenter(width/2, height/2))
        //      .force('collision', d3.forceCollide().radius(function(d) {
        //          return 10;
        //      }));
 
        //  // DRAW THE LINKS (SVG LINE)
 
        //  var link = svg.append("g")
        //      .selectAll("line")
        //      .data(links)
        //      .join("line")
        //      .attr("stroke-width", function(d){
        //          return Math.sqrt(d.value)
        //      })
        //      .attr("stroke", "#999")
        //      .attr("stroke-opacity", 0.6);
             
 
        //  // DRAW THE NODES (SVG CIRCLE)
        //  var node = svg.selectAll(".node")
        //      .data(nodes)
        //      .enter()
        //      .append("circle")
        //      .attr("class", "node")
        //      .attr("r", 5)
        //      .attr("fill", function(d){
        //          if(d.country == "United States"){
        //              return "blue";
        //          }
        //          else{
        //              return "red";
        //          }
        //      });

    })
        


    

    }