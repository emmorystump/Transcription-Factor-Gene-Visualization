/*
 * Root file that handles instances of all the charts and loads the visualization
 */

(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        var self = this;
        // set organism depending on what user clicked on home page

        // add organism heading to index.html
        $(document).ready(function(){
        $(".organism-selector").click(function(d){
              $('#homepage').addClass("hide");
              $('#main-vis').removeClass("hide");
              $('#main-vis').addClass("show");

              var img_selection = d.currentTarget.id.split("-")[0];
              console.log(img_selection)

              switch (img_selection){
                case "fly":
                  this.organism = "Drosophila melanogaster"
                  break;
                case "yeast":
                  this.organism = "Saccharomyces cerevisiae"
                  break;
                case "human":
                  this.organism = "Human"
                  break;
              } // end switch

              // update edge chart heading for selected species
              $("#edge-chart-heading").text(this.organism + " Network");

            }) // end click function

            // Add jQuery event for toggleable side bar
            $('#sidebarCollapse').on('click', function () {
                $('#toggle-sidebar').toggleClass('active');
            });
          
       
          }); // end jquery

          // on click function for Organisms link on main-vis (return to homepage/organism selector)
          $(document).ready(function(){
              $("#homepage-return").click(function(d){
                $('#main-vis').removeClass("show");
                $('#main-vis').addClass("hide");
                $('#homepage').removeClass("hide");
              }) // end click function
            }) // end jquery

        //Creating instances for each visualization

        // var edgeWeightDistribution = new edgeWeightDistribution();
        //var togglePage = new togglePage();
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

            //called only once when the class is initialized
            init();
        }
        return instance;
    }

    Main.getInstance();
})();
