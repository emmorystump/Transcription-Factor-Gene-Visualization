/*
 * Root file that handles instances of all the charts and loads the visualization
 */

(function () {
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
      }; // end switch


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

            }); // end on change
          }); // end jquery

      // instantiate classes which depend on network ()
      // eventually want to package the whole network vix in one function that takes a path to a directory to visualize?
      // TODO: working on making this the data processing function which farms out data to other functions
      var networkDetail = new NetworkDetail()
      // instantiate weights
      var weights = new Weights(networkDetail.colorScheme, organism);
      var goHeatmap =  new GoHeatmap(networkDetail); //self.colorScheme, networkDetail note the inherentence from other objects, particularly the colorScheme
                                                                      // TODO: should pass the first x (in this case four) functional_categories, which should always be the go/functional terms
      // check inheritence -- does goHeatmap have networkDetail functions in goManhattenPlot? If so, last two arguments redundent
      var goManhattenPlot = new GoManhattenPlot(goHeatmap); //note the inherentence from other objects, particularly the colorScheme
      // same re: above. This should be the topmost structure
      var network = new Network(goManhattenPlot);

      // tab functionality for gene/go detail
      // cite: https://codepen.io/jcblw/pen/DxAJF
      // TODO: FIGURE OUT WHY CLICKING TABS SHIFTS PAGE VIEW TO TOP WHEN SCROLLED DOWN
      var network_detail_tabs = $('.tabs.network-detail-tabs > li');
      network_detail_tabs.on("click", function(d,i){
        network_detail_tabs.removeClass('active');
        $(this).addClass('active');
        if (this.attributes.id.nodeValue == "go-detail-tab"){
          $(".gene-detail-text").empty();
          networkDetail.appendText("", "go")
        } else{
          $(".go-detail-text").empty();
          networkDetail.appendText("", "gene")
        }
      });
      // tab functionality for manhatten plot/grid
      var plot_tabs = $('.tabs.plot-tabs > li');
      plot_tabs.on("click", function(d,i){
        plot_tabs.removeClass('active');
        $(this).addClass('active');
        if (this.attributes.id.nodeValue == "heatmap-plot-selector"){
          console.log("heatmap")
          //goHeatmap.appendPlot()
        } else{
          console.log("manhattenplot")
          //goManhattenPlot.appendPlot()
        }
      });

      var files =["data/fruitfly/gene_info.json", "data/yeast/gene_info.json"];
      var promises = [];
      files.forEach(function(url) {
        promises.push(d3.json(url));
      });// end jquery


    Promise.all(promises).then(function (values) {
      if (organism == "fly") {
        var data = values[0];
      }
      else if (organism == "yeast") {
        var data = values[1]
      }
      if(sessionStorage.getItem("selectedType") == null){
        sessionStorage.setItem("selectedType", "tf");
      }

      d3.select("#selectedSubmit").on('click', function () {
        var form_type = $('#selectUploadType').val();

        if (form_type === "tf-form") {
          if ($('#selectTfFile').val() === "") {
            window.alert("You must enter a valid Transcription Factor.");
          } else {
            sessionStorage.setItem("selectedTf", $('#selectTfFile').val());
            sessionStorage.setItem("selectedType", "tf")
            network.update(
              data,
              organism,
              sessionStorage.getItem("selectedTf"),
              sessionStorage.getItem("min-weight"),
              sessionStorage.getItem("max-weight"),
              sessionStorage.getItem("selectedType")
            );
          }
        }
        else {
          console.log($('#selectGeneFile').val());
          if ($('#selectGeneFile').val() === "") {
            window.alert("You must enter a valid Gene.");
          } else {
            sessionStorage.setItem("selectedGenes", $('#selectGeneFile').val());
            sessionStorage.setItem("selectedType", "gene")

            network.update(
              data,
              organism,
              sessionStorage.getItem("selectedGenes"),
              sessionStorage.getItem("min-weight"),
              sessionStorage.getItem("max-weight"),
              sessionStorage.getItem("selectedType")
            );
          }
        }


        // Commenting this out for now - PLs dont delete
        // else {
        //   uploaded_genes = [];
        //   var uploadedFiles = document.getElementById("selectGeneFile");

        //   if(uploadedFiles.files[0] != undefined) {
        //     var file = uploadedFiles.files[0];
        //     var reader = new FileReader();

        //     reader.onload = function(e) {
        //       var data = e.target.result;
        //       var workbook = XLSX.read(data, {
        //         type: 'binary'
        //       });

        //       workbook.Strings.forEach(function(s) {
        //         uploaded_genes.push(s.t);
        //       });

        //       uploaded_genes.sort();
        //       sessionStorage.setItem("selectedGenes", uploaded_genes);
        //     };

        //     reader.readAsBinaryString(file);
        //   }

        // }

      })

      // When user updates weight thresholds
      d3.select("#weights-submitted").on('click', function (event) {

        sessionStorage.setItem("min-weight", $("#min-weight").val());
        sessionStorage.setItem("max-weight", $("#max-weight").val());
        if (sessionStorage.getItem("selectedType") == "tf") {
          var storageToGet = "selectedTf"
        }
        else if (sessionStorage.getItem("selectedType") == "gene") {
          var storageToGet = "selectedGenes"
        }

        network.update(
          data,
          organism,
          sessionStorage.getItem(storageToGet),
          sessionStorage.getItem("min-weight"),
          sessionStorage.getItem("max-weight"),
          sessionStorage.getItem("selectedType")
        );


      });


      // console.log("First Update: ");
      // console.log(sessionStorage.getItem("min-weight"));
      // console.log(sessionStorage.getItem("max-weight"));
      console.log("first init selectedType: " + sessionStorage.getItem("selectedType"))
      console.log("first init selectedTf: " + sessionStorage.getItem("selectedTf"))
      console.log("first init selectedGenes: " + sessionStorage.getItem("selectedGenes"))

      network.update(
        data,
        organism,
        sessionStorage.getItem("selectedTf"),
        sessionStorage.getItem("min-weight"),
        sessionStorage.getItem("max-weight"),
        sessionStorage.getItem("selectedType")
      );


    });
  } // end init()

  /**
   *
   * @constructor
   */
  function Main() {
    if (instance !== null) {
      throw new Error("Cannot instantiate more than one Class");
    }

  }

  /**
   *
   * @returns {Main singleton class |*}
   */
  Main.getInstance = function () {
    var self = this
    if (self.instance == null) {
      self.instance = new Main();

      //called only once when the class is initialized
      init();
    }
    return instance;
  }

  Main.getInstance();
})();
