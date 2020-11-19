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
        //Creating instances for each visualization
        var network = new Network();

        //load the data
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
            var data = values[0];
            console.log(data)
            network.update(data);   
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

