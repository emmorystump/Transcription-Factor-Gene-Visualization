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

      var organism = sessionStorage.getItem("organism")
      switch (organism){
        case "fly":
          this.organism = "Drosophila melanogaster"
          break;
        case "yeast":
          this.organism = "Saccharomyces cerevisiae"
          break;

      } // end switch


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
      // instantiate classes that depend on, or are independent of, network (network instantiated below)
      var goNetwork = new GoNetwork();
      var networkDetail = new NetworkDetail(goNetwork);
      var weights = new Weights(organism);

      var geneDetail = new GeneDetail(networkDetail)
      var network = new Network(networkDetail, geneDetail, goNetwork)
      //load the data TODO: BASED ON ORGANISM SELECTION

      var files =
      [
          "data/fruitfly/gene_info.json",
          "data/yeast/gene_info.json"
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

          d3.select("#selectedSubmit").on('click', function(){
            sessionStorage.setItem("selectedTf", $('#selectTfFile').val())
          })

          // When user updates weight thresholds
          d3.select("#weights-submitted").on('click', function(event){
            console.log("Weights in main.js");
            console.log($("#min-weight").val());
            console.log($("#max-weight").val());

            sessionStorage.setItem("min-weight",$("#min-weight").val());
            sessionStorage.setItem("max-weight",$("#max-weight").val());
            
            network.update(
              data,
              organism,
              sessionStorage.getItem("selectedTf"),
              sessionStorage.getItem("min-weight"),
              sessionStorage.getItem("max-weight"));

          })

          console.log("First Update: ");
          console.log(sessionStorage.getItem("min-weight"));
          console.log(sessionStorage.getItem("max-weight"));

          network.update(
            data,
            organism,
            sessionStorage.getItem("selectedTf"),
            sessionStorage.getItem("min-weight"),
            sessionStorage.getItem("max-weight"));


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
