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

    # initialize output dicts
    ff_tf_to_target = []
    y_tf_to_target = []

    output_path = "../data/ff_tf_target_dict.json"

    
    ff_score_nonzero = ff_score[ff_score!=0.].stack()
    counter = 0
    for i in range(len(ff_tf_id.values[:, 0])):
        tf = ff_tf_id.values[:, 0][i]
        tf_nonzero_idx = ff_score.loc[tf].nonzero()
        target_names = ff_score.loc[tf].iloc[tf_nonzero_idx].index.values
        target_scores = ff_score.loc[tf].iloc[tf_nonzero_idx].values

        ff_tf_to_target.append({"id": tf, "type": "tf", "linked": target_names, "scores": target_scores})

        for j in range(len(target_names)):
            gene = ff_gene_id.values[:, 0][j]
            gene_nonzero_idx = ff_score.T.loc[gene].nonzero()
            reg_names = ff_score.T.loc[gene].iloc[gene_nonzero_idx].index.values
            reg_scores = ff_score.T.loc[gene].iloc[gene_nonzero_idx].values
            
            ff_tf_to_target.append({"id": target_names[i], "type": "gene", "linked": reg_names, "scores": reg_score})
        
    # with open(output_path, 'w') as fp:
    #     json.dump(ff_tf_to_target, fp)


if __name__ == '__main__':
    # main(sys.argv)
    main()