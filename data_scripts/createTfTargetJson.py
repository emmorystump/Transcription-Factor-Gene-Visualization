#!/usr/bin/env python
import os
import json
import numpy as np
import pandas as pd

def main():
    """
    main method
    :return: None. json is written to output directory
    """
    # read in gene id, TF id and score matrix
    ff_gene_id = pd.read_csv("../data/FRUIT_FLY/OUTPUT/genes", header=None)
    y_gene_id = pd.read_csv("../data/YEAST/OUTPUT/genes", header=None)

    ff_tf_id = pd.read_csv("../data/FRUIT_FLY/OUTPUT/regulators", header=None)
    y_tf_id = pd.read_csv("../data/YEAST/OUTPUT/regulators", header=None)

    ff_score = pd.read_csv("../data/FRUIT_FLY/OUTPUT/netprophet2_network.adjmtr", sep='\t', header=None)
    y_score =  pd.read_csv("../data/YEAST/OUTPUT/netprophet2_network.adjmtr", sep='\t', header=None)

    # drop last column of NaN:
    ff_score = ff_score.drop(ff_score.columns[-1],axis=1)
    y_score = y_score.drop(y_score.columns[-1],axis=1)

    # clean up remainder NaN if any
    ff_score = ff_score.where(pd.notnull(ff_score), "None")
    y_score = y_score.where(pd.notnull(y_score), "None")

    # ff_score_nonzero = ff_score_nonzero[(df.T != 0).any()]

    # add row and col labels
    ff_score.columns = ff_gene_id.values[:, 0]
    ff_score.index = ff_tf_id.values[:, 0]
    y_score.columns = y_gene_id.values[:, 0]
    y_score.index = y_tf_id.values[:, 0]

    # initialize output lists
    ff_tf_to_target = []
    ff_target_to_tf = []
    y_tf_to_target = []

    ff_links = []
    y_links = []

  
    # ff_score_nonzero = ff_score[ff_score!=0.].stack()
    counter = 0
    for i in range(len(ff_tf_id.values[:, 0])):
        tf = ff_tf_id.values[:, 0][i]
        tf_nonzero_idx = ff_score.loc[tf].to_numpy().nonzero()
        target_names = ff_score.loc[tf].iloc[tf_nonzero_idx].index.values
        target_scores = ff_score.loc[tf].iloc[tf_nonzero_idx].values

        ff_tf_to_target.append({
            "id": tf, "type": "tf", 
            "linked": target_names.tolist(), 
            "scores": target_scores.tolist()})
      
    print("tf to target complete")

    for i in range(len(ff_gene_id.values[:, 0])):
        gene = ff_gene_id.values[:, 0][i]
        gene_nonzero_idx = ff_score.T.loc[gene].to_numpy().nonzero()
        reg_names = ff_score.T.loc[gene].iloc[gene_nonzero_idx].index.values
        reg_scores = ff_score.T.loc[gene].iloc[gene_nonzero_idx].values

        ff_target_to_tf.append({"id": gene, "type": "gene", "linked": reg_names.tolist(), "scores": reg_scores.tolist()})
        
    
    print("target to tf complete")
  
    for obj in ff_tf_to_target:
        links = [{"source": obj["id"], "target": i} for i in obj['linked']]
        ff_links = ff_links + links
        counter += 1
        print(counter)
        
    ff_node_link = {"nodes": ff_target_to_tf + ff_tf_to_target, "links": ff_links}

    print("node_link complete")
    ff_tf_target_output_path = "../data/fruitfly/ff_network.json"
    y_tf_target_output_path = "../data/yeast/y_network.json"

    
    with open(ff_tf_target_output_path, 'w') as fp:
        json.dump(ff_node_link, fp)


if __name__ == '__main__':
    main()