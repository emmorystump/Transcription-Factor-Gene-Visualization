#!/usr/bin/env python
"""
    Take in geneID_to_geneName , geneID_to_go, a link prefix to create a link to data on the gene, and file output info
     returns a json in the following structure:

     {"FBgn0040736":
                    {
                    "name": "IM3",
                    "link": "https://flybase.org/reports/FBgn0040736",
                    "description": "None",
                    "database": "ENSG,FLYBASENAME_GENE_ACC,FLYBASE_GENE_ID",
                    "go": ["GO:0002376","GO:0003674","GO:0005576","GO:0009617","GO:0019731","GO:0045087"]
                    },
     "FBgn0034454": ...
      ...
    }
    Where the FB... are geneIDs (these are for the fruit fly)

    usage example 1:
    data_scripts/createGeneJson.py -g data/yeast/genes \
    -gid2gn data/yeast/y_geneID_to_geneName.csv \
    -gid2go data/yeast/y_geneID_to_go.csv \
    -l uswest.ensembl.org/Saccharomyces_cerevisiae/Gene/Summary?g= \
    -fn gene_info \
    -o data/yeast/

    usage example 2:
    createGeneJson.py -g /home/chase/class/intro_to_vis/vis_final/data/fruitfly/genes \
    -gid2gn /home/chase/class/intro_to_vis/vis_final/data/fruitfly/ff_geneID_to_geneName.csv \
    -gid2go /home/chase/class/intro_to_vis/vis_final/data/fruitfly/ff_geneID_to_go.csv \
    -l https://flybase.org/reports/ \
    -fn gene_info \
    -o /home/chase/class/intro_to_vis/vis_final/data/fruitfly/

"""

import os
import sys
import argparse
import json
import pandas as pd

def main(argv):
    """
    main method
    :param argv: cmd line arguments, parsed by argparse
    :return: None. json is written to output directory
    """

    # assign cmd line data to var
    args = parseArgs(argv)
    gene_id_to_gene_name_path = args.geneID_to_geneName
    gene_id_to_go_path = args.geneID_to_GO
    link_prefix = args.link_prefix
    output_dir = args.output_dir
    output_file_name = args.output_file_name

    # read in data
    gene_id_to_gene_name_df = pd.read_csv(gene_id_to_gene_name_path)
    # set index to gene_ids (in column input from gparser output -- see R notebook) for each searching
    gene_id_to_gene_name_df.set_index('input', inplace=True)

    gene_id_to_go_df = pd.read_csv(gene_id_to_go_path)

    # clean up NaNs
    gene_id_to_gene_name_df = gene_id_to_gene_name_df.where(pd.notnull(gene_id_to_gene_name_df), "None")
    # open file in which to write json
    output_path = os.path.join(output_dir, output_file_name+".json")

    # initialize output dictionary, key = gene_id, value = dictionary with all other info
    output_dict = {gene_id:{} for gene_id in gene_id_to_gene_name_df.index}
    for gene_id in gene_id_to_gene_name_df.index:
    
        # insert into output dictionary
        output_dict[gene_id]['name'] = gene_id_to_gene_name_df.loc[gene_id, "name"]
        output_dict[gene_id]['link'] = link_prefix + gene_id      
        output_dict[gene_id]['description'] = gene_id_to_gene_name_df.loc[gene_id, "description"]
        database = gene_id_to_gene_name_df.loc[gene_id, "namespace"]
        output_dict[gene_id]['database'] = gene_id_to_gene_name_df.loc[gene_id, "namespace"]
        output_dict[gene_id]['go'] = gene_id_to_go_df[gene_id_to_go_df['input'] == gene_id].target.to_list()
    with open(output_path, 'w') as fp:
        json.dump(output_dict, fp)
        

    

    # print('Writing to: %s' %output_path)
    # with open(output_path, "w") as file:
    #     # open json bracket
    #     file.write("{")

    #     for gene_id in gene_id_to_gene_name_df.index:
    #         file.write("\"%s\": {" %gene_id)

    #         # extract GO terms for a given gene_id as a list
    #         go_list = gene_id_to_go_df[gene_id_to_go_df['input'] == gene_id].target.to_list()
    #         link = link_prefix+gene_id
    #         gene_name = gene_id_to_gene_name_df.loc[gene_id, "name"]
    #         description = gene_id_to_gene_name_df.loc[gene_id, "description"]
    #         database_info = gene_id_to_gene_name_df.loc[gene_id, "namespace"]

    #         # create json line (key: value structure, like so "go":[go1, go2,...], "name": geneName, "link": https://..., "database": )
    #         go_array_entry = "[\""+'\",\"'.join(go_list)+'\"]'
    #         json_line_incomplete = "\"name\": \"%s\", \"link\": \"%s\", \"description\": \"%s\", \"database\": \"%s\", \"go\": " %(gene_name, link, description, database_info)
    #         json_line = json_line_incomplete + go_array_entry

    #         # write json line
    #         file.write(json_line)

    #         # close line object bracket
    #         file.write("},")

    #     # close json bracket
    #     file.write("}")
    # print('done')

def parseArgs(argv):
    """
    parse cmd line input
    :param argv: cmd line input from sys.argv -- see end of script
    :return: parsed cmd line input (consumed by main)
    """

    parser = argparse.ArgumentParser()
    parser.add_argument('-gid2gn', '--geneID_to_geneName', required=True,
                        help='[REQUIRED] path to geneID_to_geneName.csv')
    parser.add_argument('-gid2go', '--geneID_to_GO', required=True,
                        help='[REQUIRED] path to geneID_to_go.csv ')
    parser.add_argument('-l', '--link_prefix', required=True,
                        help='[REQUIRED] the \"base path\" to a database to which the script will append the gene_id. \n'
                             'ideally the result is a working link eg https://flybase.org/reports/FBgn0000044\n'
                             'where the -l entry is https://flybase.org/reports/ NOTE THE FINAL SLASH -- MAKE SURE READY TO APPEND GENEID')
    parser.add_argument('-fn', '--output_file_name', required=True,
                        help='[REQUIRED] name of output file suffix .json will be appended')
    parser.add_argument('-o', '--output_dir', required=True,
                        help='[REQUIRED] output directory for json')

    return parser.parse_args(argv[1:])


if __name__ == '__main__':
    main(sys.argv)