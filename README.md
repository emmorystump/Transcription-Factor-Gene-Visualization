# MILESTONE 1 INSTRUCTIONS

Dear graders,

Please read (or at least scan) the_tf_network_story.docx which is in the root directory of our repository. This will provide background and context.

The goal of this project is to provide an interactive portal for the Fruit Fly and Yeast Transcription Factor Network produced by an algorithm developed by a PI here at WashU. Currently, there is no interface for this data. This is a problem, since the primary users of a TF network are biologists who may not have the computational know-how to easily access the network data.

#### USE:

First choose if you are a Fly biologist or a Yeast biologist. Click your creature.

A TF (Transcription Factor) network will appear by default. The blue node is a Transcription Factor (read the tf story!), the red nodes are the genes that this Transcription Factor regulates.

Next, please click the button "Update Inputs" on the top right hand portion of the screen. A side panel will appear. At the top of the side panel is a section labeled weights. The values represented in this normalized distribution represent the strength of evidence that the selected Transcription Factor controls a given gene. Therefore, selecting a range within this graph will return all genes regulated by the TF where the strength of evidence is between the given range. 

Use the brush to select a portion of the curve on the far righthand side. If the network is large (lots of red nodes), select less of the distrubtion and click "Update Weights". Too many nodes still? Select even less of the curve and update.

This function is important because different biologists will have different uses for this data -- if this biologist is doing a large genomics experiment, they may want to allow more edges per TF, so that they get more genes per TF to test, even though those edges are less deterministic. If the biologist is going to explore these genes by hand in some way, they will want a more stringent threshold.

Currently, we only support brushing within the range (mean + standard deviation) to (mean + 3 * standard deviation). This is primarily for 2 reasons. Firstly, supporting the entire normalized curve is simply too much data for our application to load. Secondly, biologists will rarely use data with a weight threshold of such a low strength of evidence that it is not contained with this range. Overall, they will primarily be looking at the top percentage of the distribution. 

Next, a biologist would want to either enter their favorite transcription factor, or a gene list. Please notice the space in which that entry would happen in the right side panel. If you are a fly biologist, try entering FBgn0016917. It has a lot of targets -- you may want to decrease your threshold! 

At this point, imagine you've entered a TF (or maybe you really did). The graphs on your screen have populated for that TF/target network. You should play around with the nodes/edges graph at this point by dragging the nodes, hovering over them, and clicking on them. Eventually, a user will have options of spatial organizations of these nodes.

When you click a gene (all nodes are genes, but the blue one is special because it is a regulator of the red genes), information is populated in the "Gene Detail". This is a place holder at this point, though some information will be populated.

If there isn't much interesting happening on the Gene Ontology (GO) graph below the node/edge graph, reload and see what a new network looks like. Do this until you get more than a handful of dots. Different network clusters return more significant hits (see below) than others.

Ontology, remember, means "hierarchy of knowledge". GO is one of computational biology's methods of beginning to figure out what genes do and how they relate to one another. The graph is created by sending the target gene list to an external database, which returns GO annotation and a significance score, among other things. The x-axis are different categories that the genes fall into -- for example, GO:BP is a "biological process" while GO:MF is a "molecular function". The dots are (size and height) ranked by their significance. Only annotations that have an adjusted p-value greater than .05 are displayed, and the scale is -log10, so the higher the better.

This graph does not have its interactivity yet. Please see the process book for a drawing of what it will do.

Eventually, there will be functionality to allow the user to group the genes in various different ways (eg, by whether or not there is experimental support for the TF/target edge, or by the gene function).

#### DATA STRUCTURES
Data structures are in place in the data director. Data is also queried from external databases on-demand and parsed in the scripts themselves. 

# Citation (also in line in code):


For help making a toggleable modal:
https://codepen.io/bootpen/pen/jbbaRa?__cf_chl_jschl_tk__=6e74ff2d1f9ca78d7e87a8204e4d3768d418c612-1605908965-0-Acrf5bXH7tDZp4CB_2uWBDWiOruxlGeKriECOOB5G7ERkanHAhXgGDtjQcCMyHbaPs9qsABCWbIWPw-P4smJ1VyRFLUt-9VQMa9N8dD46Tpbg4PnOk7VEXDbsjJvGv8ernjxrrB8uyRceH-NdN4G5kbnm-252EOY-Gp6MYoxNBJKg7VkNMtk-d_-nDXVCCwCgsVIAxRs3x2O3MAnGk9LsuAmtvZlnFajT3i2KRG8n0JA-6dD2vjoib6J6O8E78jJ-qeM6VVLbv0mP_eEkfMwX7O2K9J9myyz9L5yyMZAH2qU731zKflYK7lkMmuMXuL06lnzshkYNZoTW--_1st7tN1XQ0omOQRohPPV6qdUYRkEpTKcfdmY8ckDZ1RP0a1Ikbu7tfEWkr_769b9NOvIoO8

For help making the normalized graph: 
https://bl.ocks.org/EfratVil/99462577a475bbad4be1146caca75a58
