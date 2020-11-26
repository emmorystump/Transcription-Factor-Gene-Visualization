if (typeof(Storage) !== "undefined") {
    // Store
    var organism = "";
    // see https://www.ebi.ac.uk/QuickGO/api/index.html#!/gene_ontology/getChartUsingGET_1
    // note: to get the json that creates the png, go here https://www.ebi.ac.uk/QuickGO/api/index.html#!/gene_ontology/getChartCoordinatesUsingGET_1
    sessionStorage.setItem("go_chart_url_prefix", "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/%7Bids%7D/chart?ids=");
    // see https://www.ebi.ac.uk/QuickGO/api/index.html#!/gene_ontology/getGraphUsingGET_1
    sessionStorage.setItem("go_json_graph_url_prefix", "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/graph?startIds=";);
    // see https://biit.cs.ut.ee/gprofiler/convert
    sessionStorage.setItem("gprofiler_convert_prefix", "https://biit.cs.ut.ee/gprofiler/convert?organism=");
    $(document).ready(function() {
        $(document).on('click','.organism-selector',function(e){
            e.preventDefault();
            if(e.target.id == "fly-img"){
                organism = "fly";
                organism_code = "dmelanogaster"
                gene_name_database = "FLYBASENAME_GENE"
                sessionStorage.setItem("organism", organism)
                sessionStorage.setItem("organism_code", organism_code)
                sessionStorage.setItem("gene_name_database", gene_name_database)
                window.location.href='main.html';
            }
            else if(e.target.id == "yeast-img"){
                organism = "yeast";
                organism_code = "scerevisiae"
                gene_name_database = "ENSG"
                sessionStorage.setItem("organism", organism)
                sessionStorage.setItem("organism_code", organism_code)
                sessionStorage.setItem("gene_name_database", gene_name_database)
                window.location.href='main.html';
            }


        }); // end on click
    }); // end document ready

} // end outer if

function redirectAndClearSession(destination){
    sessionStorage.clear();
    window.location.href = destination;
}
