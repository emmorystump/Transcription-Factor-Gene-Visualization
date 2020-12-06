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

    // Build color scale for go categories input to manhatten plot and GoHeatMap
    self.functional_categories = ["GO:BP", "GO:CC", "GO:MF", "KEGG"];
    self.goColorScheme = d3.scaleOrdinal()
      .domain(self.functional_categories)
      .range(["#d95f02", "#f0027f", "#6a3d9a", "#33a02c"]);

    var organism = sessionStorage.getItem("organism")
    switch (organism) {
      case "fly":
        this.organism = "Drosophila melanogaster"
        break;
      case "yeast":
        this.organism = "Saccharomyces cerevisiae"
        break;

    } // end switch


    $(document).ready(function () {
      // Add jQuery event for toggleable side bar
      $('#sidebarCollapse').on('click', function () {
        $('#toggle-sidebar').toggleClass('active');
      });

    }); // end jquery

    // When tf/gene list select input is changed, get which option it is
    $(document).ready(function () {
      $('#selectUploadType').on('change', function () {
        // based on this value, which is equal to the option id, choose whether to hide or show an input box for tf and a file upload for gene list
        if (this.value === "gene-input-form") {
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

    // instantiate weights
    var weights = new Weights(organism);
    // instantiate classes which depend on network ()
    var geneDetail = new GeneDetail()
    var goHeatmap = new GoHeatmap(self.goColorScheme);
    var goManhattenPlot = new GoManhattenPlot(goHeatmap, self.functional_categories, self.goColorScheme);
    var network = new Network(geneDetail, goManhattenPlot);


    var files = ["data/fruitfly/gene_info.json", "data/yeast/gene_info.json"];
    var promises = [];
    files.forEach(function (url) {
      promises.push(d3.json(url));
    });

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
