#!/bin/bash
find output/ -type f -exec rm {} \; 
python ./generate.py
rsync -a output/ ../magento/
