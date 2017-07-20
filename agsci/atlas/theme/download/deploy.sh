#!/bin/bash
find output/ -type f -exec rm {} \; 
python ./generate.py
find ../magento/ -name themecache\* -exec rm {} \;
rsync -a output/ ../magento/
