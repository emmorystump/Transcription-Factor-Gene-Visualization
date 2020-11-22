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
      var organism = localStorage.getItem("organism")
      switch (organism){
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

      $(document).ready(function(){
            // Add jQuery event for toggleable side bar
            $('#sidebarCollapse').on('click', function () {
                $('#toggle-sidebar').toggleClass('active');
            });

          }); // end jquery

          // When tf/gene list select input is changed, get which option it is
          $(document).ready(function(){
            $('#selectUploadType').on('change', function() {
              // based on this value, which is equal to the option id, choose whether to hide or show an input box for tf and a file upload for gene list
              if(this.value==="gene-input-form") {
                $('#gene-input-form').removeClass("hide");
                $('#gene-input-form').addClass("show");

                $('#tf-form').removeClass("show");
                $('#tf-form').addClass("hide");
              }
              else {
                $('#tf-form').removeClass("hide");
                $('#tf-form').addClass("show");

                $('#gene-input-form').removeClass("show");
                $('#gene-input-form').addClass("hide");
              }

            });
          }) // end jquery
      var networkDetail = new NetworkDetail("test");
      var network = new Network();
      var weights = new Weights();
      //load the data TODO: BASED ON ORGANISM SELECTION

      var files =
      [
          "data/fruitfly/ff_gene_info.json",
          "data/yeast/yeast_gene_info.json"
      ];
      var promises = [];
      files.forEach(function(url) {
        promises.push(d3.json(url));
      });
      Promise.all(promises).then(function(values) {
          if(organism == "fly"){
            var data = values[0];
          }
          else if (organism == "yeast"){
            var data = values[1]
          }
          network.update(data, organism, "");
      });
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
