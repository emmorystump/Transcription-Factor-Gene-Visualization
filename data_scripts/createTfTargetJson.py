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

    ff_tf_target_output_path = "../data/fruitfly/tf_to_target/"
    y_tf_target_output_path = "../data/yeast/tf_to_target/"

    print(np.mean(y_score.values), np.std(y_score.values))

    # for i in range(len(ff_tf_id.values[:, 0])):
    #     tf = ff_tf_id.values[:, 0][i]
    #     tf_nonzero_idx = ff_score.loc[tf].to_numpy().nonzero()
    #     target_names = ff_score.loc[tf].iloc[tf_nonzero_idx].index.values
    #     target_scores = ff_score.loc[tf].iloc[tf_nonzero_idx].values

    #     ff_tf_to_target.append({
    #         "id": tf, 
    #         "type": "tf", 
    #         "linked": target_names.tolist(), 
    #         "scores": target_scores.tolist()})
    
    # for obj in ff_tf_to_target:
    
    #     with open(ff_tf_target_output_path+obj["id"]+".json", 'w') as fp:
    #         json.dump(obj, fp)

    # print("Fly tf to target done")

    # for i in range(len(y_tf_id.values[:, 0])):
    #     tf = y_tf_id.values[:, 0][i]
    #     tf_nonzero_idx = y_score.loc[tf].to_numpy().nonzero()
    #     target_names = y_score.loc[tf].iloc[tf_nonzero_idx].index.values
    #     target_scores = y_score.loc[tf].iloc[tf_nonzero_idx].values

    #     y_tf_to_target.append({
    #         "id": tf, 
    #         "type": "tf", 
    #         "linked": target_names.tolist(), 
    #         "scores": target_scores.tolist()})
    
    # for obj in y_tf_to_target:
    
    #     with open(y_tf_target_output_path+obj["id"]+".json", 'w') as fp:
    #         json.dump(obj, fp)

    # print("Yeast tf to target done")

    # for i in range(len(ff_gene_id.values[:, 0])):
    #     gene = ff_gene_id.values[:, 0][i]
    #     gene_nonzero_idx = ff_score.T.loc[gene].to_numpy().nonzero()
    #     reg_names = ff_score.T.loc[gene].iloc[gene_nonzero_idx].index.values
    #     reg_scores = ff_score.T.loc[gene].iloc[gene_nonzero_idx].values


    #     ff_target_to_tf.append({"id": gene, 
    #     "type": "gene", 
    #     "linked": reg_names.tolist(), 
    #     "scores": reg_scores.tolist()})
    

    
    # print("target to tf complete")
  
    # for obj in ff_tf_to_target:
    #     links = [{"source": obj["id"], "target": i} for i in obj['linked']]
    #     ff_links = ff_links + links
    #     counter += 1
    #     print(counter)
        
    # ff_node_link = {"nodes": ff_target_to_tf + ff_tf_to_target, "links": ff_links}

    # print("node_link complete")
   
    
    # with open(ff_tf_target_output_path, 'w') as fp:
    #     json.dump(ff_node_link, fp)


if __name__ == '__main__':
    main()