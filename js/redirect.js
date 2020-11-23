if (typeof(Storage) !== "undefined") {
    // Store
    var organism = "";
    $(document).ready(function() {
        $(document).on('click','button',function(e){
            e.preventDefault();
            if(e.target.id == "fly-img"){
                organism = "fly";
                organism_code = "dmelanogaster"
                gene_name_database = "FLYBASENAME_GENE"
                localStorage.setItem("organism", organism)
                localStorage.setItem("organism_code", organism_code)
                localStorage.setItem("gene_name_database", gene_name_database)
                window.location.href='main.html';
            }
            else if(e.target.id == "yeast-img"){
                organism = "yeast";
                organism_code = "scerevisiae"
                gene_name_database = "ENSG"
                localStorage.setItem("organism", organism)
                localStorage.setItem("organism_code", organism_code)
                localStorage.setItem("gene_name_database", gene_name_database)
                window.location.href='main.html';
            }
            else{
                organism = "human";
                localStorage.setItem("organism", organism)
                window.location.href='main.html';

            }

        }); // end on click
    }); // end document ready

} // end outer if
