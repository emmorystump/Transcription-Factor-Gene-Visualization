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
    ff_target_to_tf = []
    y_target_to_tf = []
 

    ff_links = []
    y_links = []

    ff_target_tf_output_path = "../data/fruitfly/target_to_tf/"
    y_target_tf_output_path = "../data/yeast/target_to_tf/"

    print(np.mean(y_score.values), np.std(y_score.values))

    for i in range(len(ff_gene_id.values[:, 0])):
        target = ff_gene_id.values[:, 0][i]
        target_nonzero_idx = ff_score.T.loc[target].to_numpy().nonzero()
        tf_names = ff_score.T.loc[target].iloc[target_nonzero_idx].index.values
        tf_scores = ff_score.T.loc[target].iloc[target_nonzero_idx].values

        ff_target_to_tf.append({
            "id": target, 
            "type": "gene", 
            "linked": tf_names.tolist(), 
            "scores": tf_scores.tolist()})
    
    for obj in ff_target_to_tf:
    
        with open(ff_target_tf_output_path+obj["id"]+".json", 'w') as fp:
            json.dump(obj, fp)

    print("Fly tf to target done")

    for i in range(len(y_gene_id.values[:, 0])):
        target = y_gene_id.values[:, 0][i]
        target_nonzero_idx = y_score.T.loc[target].to_numpy().nonzero()
        tf_names = y_score.T.loc[target].iloc[target_nonzero_idx].index.values
        tf_scores = y_score.T.loc[target].iloc[target_nonzero_idx].values

        y_target_to_tf.append({
            "id": target, 
            "type": "gene", 
            "linked": tf_names.tolist(), 
            "scores": tf_scores.tolist()})
    
    for obj in y_target_to_tf:
    
        with open(y_target_tf_output_path+obj["id"]+".json", 'w') as fp:
            json.dump(obj, fp)

    print("Yeast tf to target done")

    


if __name__ == '__main__':
    main()