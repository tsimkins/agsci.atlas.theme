#!/bin/bash
find output/ -type f -exec rm -f {} \; 
python ./generate.py
find ../magento/ -name themecache\* -exec rm -f {} \;
rsync -a output/ ../magento/
