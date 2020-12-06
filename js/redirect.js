if (typeof(Storage) !== "undefined") {
    // Store
    var organism = "";
    $(document).ready(function() {
        $(document).on('click','.organism-selector',function(e){
            e.preventDefault();
            sessionStorage.clear();
            if(e.target.classList.contains('fly')){
                organism = "fly";
                organism_code = "dmelanogaster"
                gene_name_database = "FLYBASENAME_GENE"
                sessionStorage.setItem("organism", organism)
                sessionStorage.setItem("organism_code", organism_code)
                sessionStorage.setItem("gene_name_database", gene_name_database)
                window.location.href='main.html';
            }
            else if(e.target.classList.contains('yeast')){
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
