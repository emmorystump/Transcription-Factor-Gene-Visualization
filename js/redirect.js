if (typeof(Storage) !== "undefined") {
    // Store
    var organism = "";
    $(document).ready(function() {
        $(document).on('click','button',function(e){
            e.preventDefault();
            if(e.target.id == "fly-img"){
                organism = "fly";
                localStorage.setItem("organism", organism)
                window.location.href='main.html';
            }
            else if(e.target.id == "yeast-img"){
                organism = "yeast";
                localStorage.setItem("organism", organism)
                window.location.href='main.html';
            }
            else{
                organism = "human";
                localStorage.setItem("organism", organism)
                window.location.href='main.html';

            }
       
        });
    });

}
