/*
 * Root file that handles instances of all the charts and loads the visualization
 */

(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init(organism_selection) {
        var self = this;
        // set organism depending on what user clicked on home page
        console.log(organism_selection);
        switch (organism_selection){
          case "fly":
            this.organism = "Drosophila melanogaster"
            break;
          case "yeast":
            this.organism = "Saccharomyces cerevisiae"
            break;
          case "human":
            this.organism = "Human"
            break;
        }

        // load main visualization html
        window.location.href = "index.html";
        // add organism heading to index.html
        var heading = "<h1 id=\"organism-heading\" class=\"h2\">" + this.organism + " Network</h1>"
        console.log(heading);

        $(document).ready(function(){
          var x = $("body").append("TEST"); //HAVING TROUBLE HERE
                    console.log(x)
        }) // end jquery
        //Creating instances for each visualization

        // var edgeWeightDistribution = new edgeWeightDistribution();
        var network = new Network();

        //load the data TODO: BASED ON ORGANISM SELECTION
        var files =
        [
            "data/fruitfly/ff_gene_info.json",
            "data/yeast/yeast_gene_info.json"

        ];
        var promises = [];
        // files.forEach(function(url) {
        //   promises.push(d3.json(url));
        // });
        // Promise.all(promises).then(function(values) {
        //     var data = values[0];
        //     console.log(data)
        //     network.update(data);
        // });
    } // end init()

    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this
        if(self.instance == null){
            self.instance = new Main();

        $(document).ready(function(){
          $(".organism-selector").click(function(d){
            this.organism = d.currentTarget.id.split("-")[0];
            init(this.organism);

            // this.organism = d.currentTarget;
              // window.location.href = "index.html";

              }) // end click function
            }) // end jquery

            //called only once when the class is initialized
        }
        return instance;
    }

    Main.getInstance();
})();
