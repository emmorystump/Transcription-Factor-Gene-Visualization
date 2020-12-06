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

      // Colors associated with major components of page -- passed as argument to each object below
      // Changing the color here will change the color for each element in each vis (eg, if you don't like the GO:BP color, change the first item)
      self.functional_categories = ["GO:BP", "GO:CC","GO:MF","KEGG", "tf", "gene"];
      self.colorScheme = d3.scaleOrdinal()
        .domain(self.functional_categories)
        .range(["#751A33","#D28F33","#B34233","#88867D", "#1F4141", "#1A8693"]);

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

      // instantiate weights
      var weights = new Weights(self.colorScheme, organism);
      // instantiate classes which depend on network ()
      var geneDetail = new GeneDetail(self.colorScheme)
      var goHeatmap = new GoHeatmap(self.colorScheme); //note the inherentence from other objects, particularly the colorScheme
      var goManhattenPlot = new GoManhattenPlot(self.colorScheme, geneDetail, goHeatmap, self.functional_categories); //note the inherentence from other objects, particularly the colorScheme
      var network = new Network(self.colorScheme, geneDetail, goManhattenPlot);

      // tab functionality for gene/go detail
      // cite: https://codepen.io/jcblw/pen/DxAJF
      var tabs = $('.tabs > li');
      tabs.on("click", function(d,i){
        tabs.removeClass('active');
        $(this).addClass('active');
        if (this.attributes.id.nodeValue == "go-detail-tab"){
          $(".gene-detail-text").empty();
          geneDetail.appendText("", "go")
        } else{
          $(".go-detail-text").empty();
          geneDetail.appendText("", "gene")
        }
      });


      var files =["data/fruitfly/gene_info.json", "data/yeast/gene_info.json"];
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
            var form_type = $('#selectUploadType').val();

            if (form_type === "tf-form") {
              console.log($('#selectTfFile').val())
              sessionStorage.setItem("selectedTf", $('#selectTfFile').val());

              network.update(
                data,
                organism,
                sessionStorage.getItem("selectedTf"),
                sessionStorage.getItem("min-weight"),
                sessionStorage.getItem("max-weight"));
            }
            else {
              uploaded_genes = [];
              var uploadedFiles = document.getElementById("selectGeneFile");

              if(uploadedFiles.files[0] != undefined) {
                var file = uploadedFiles.files[0];
                var reader = new FileReader();

                reader.onload = function(e) {
                  var data = e.target.result;
                  var workbook = XLSX.read(data, {
                    type: 'binary'
                  });

                  workbook.Strings.forEach(function(s) {
                    uploaded_genes.push(s.t);
                  });

                  uploaded_genes.sort();
                  sessionStorage.setItem("selectedGenes", uploaded_genes);
                };

                reader.readAsBinaryString(file);
              }

            }

          })

          // When user updates weight thresholds
          d3.select("#weights-submitted").on('click', function(event){

            sessionStorage.setItem("min-weight",$("#min-weight").val());
            sessionStorage.setItem("max-weight",$("#max-weight").val());

            network.update(
              data,
              organism,
              sessionStorage.getItem("selectedTf"),
              sessionStorage.getItem("min-weight"),
              sessionStorage.getItem("max-weight"));

          });


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
