# MILESTONE 1 INSTRUCTIONS

Dear graders,

Please read (or at least scan) the_tf_network_story.docx which is in the root directory of our repository. This will provide background and context.

The goal of this project is to provide an interactive portal for the Fruit Fly and Yeast Transcription Factor Network produced by an algorithm developed by a PI here at WashU. Currently, there is no interface for this data. This is a problem, since the primary users of a TF network are biologists who may not have the computational know-how to easily access the network data.

#### USE:

First choose if you are a Fly biologist or a Yeast biologist. Click your creature.

A TF network will appear by default. The blue node is a Transcription Factor (read the tf story!), the red nodes are the genes that TF regulates.

Next, please click the button "Update Inputs" on the top right hand portion of the screen. A side panel will appear. It is here that you will determine a threshold to set on the strength of evidence that a TF actually controls a given gene. This is important because different biologists will have different uses for this data -- if this biologist is doing a large genomics experiment, they may want to allow more edges per TF, so that they get more genes per TF to test, even though those edges are less deterministic. If the biologist is going to explore these genes by hand in some way, they will want a more stringent threshold.

This is an aspect of the functionality that is important -- in the network data that the biologist would otherwise have to deal with, there is an edge from every TF to every gene, as the algorithm that determines the edges is probabilistic. The edge weights, however, are "scores" rather than "probabilities", and it is not immediately clear how to deal with setting a filter. This function offers a hopefully more intuitive method.

Next, a biologist would want to either enter their favorite transcription factor, or a gene list. Please notice the space in which that entry would happen in the right side panel.

At this point, imagine you've entered a TF and the graphs that are on your screen have appeared. You should play around with the network at this point by dragging the nodes, hovering over them, and clicking on them.

When you click a gene, information is populated in the "Gene Detail". This is essentially a place holder at this point, though some information will be populated.

If there isn't much interesting happening on the GO network below the node/edge graph, reload and see what a new network looks like. Do this until you get more than a handful of dots. Different network clusters return more significant hits (see below) than others.

GO stands for Gene Ontology. Ontology, remember, means "hierarchy of knowledge". GO is one of computational biology's methods of beginning to figure out what genes do and how they relate to one another. The graph is created by sending the target gene list to an external database, which returns GO annotation and a significance score, among other things. The x-axis are different categories that the genes fall into -- for example, GO:BP is a "biological process" while GO:MF is a "molecular function". The dots are (size and height) ranked by their significance. Only annotations that have an adjusted p-value greater than .05 are displayed, and the scale is -log10, so the higher the better.

This graph does not have its interactivity yet. Please see the process book for a drawing of what it will do.

Eventually, there will be functionality to allow the user to group the genes in various different ways (eg, by whether or not there is experimental support for the TF/target edge, or by the gene function).

#### DATA STRUCTURES
Data structures are in place in the data director. Data is also queried from external databases on-demand and parsed in the scripts themselves. 





# Citation (also in line in code):


For help making a toggleable modal:
https://codepen.io/bootpen/pen/jbbaRa?__cf_chl_jschl_tk__=6e74ff2d1f9ca78d7e87a8204e4d3768d418c612-1605908965-0-Acrf5bXH7tDZp4CB_2uWBDWiOruxlGeKriECOOB5G7ERkanHAhXgGDtjQcCMyHbaPs9qsABCWbIWPw-P4smJ1VyRFLUt-9VQMa9N8dD46Tpbg4PnOk7VEXDbsjJvGv8ernjxrrB8uyRceH-NdN4G5kbnm-252EOY-Gp6MYoxNBJKg7VkNMtk-d_-nDXVCCwCgsVIAxRs3x2O3MAnGk9LsuAmtvZlnFajT3i2KRG8n0JA-6dD2vjoib6J6O8E78jJ-qeM6VVLbv0mP_eEkfMwX7O2K9J9myyz9L5yyMZAH2qU731zKflYK7lkMmuMXuL06lnzshkYNZoTW--_1st7tN1XQ0omOQRohPPV6qdUYRkEpTKcfdmY8ckDZ1RP0a1Ikbu7tfEWkr_769b9NOvIoO8

For help making the normalized graph (placeholder): 
https://bl.ocks.org/EfratVil/99462577a475bbad4be1146caca75a58