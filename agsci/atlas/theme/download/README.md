# Theme Downloader

This is done outside of Plone, and is a bit of a kludge.  Will refine.

## Requirements

 * Python package **PyTidyLib**
 * Python package **beautifulsoup4**
 * Modern version of Tidy ([git repository](https://github.com/htacg/tidy-html5)) in `/usr/local`
 
## Steps

### Get the HAR file
1. Go to the template URL in Firefox
1. Open the Inspector (Tools -> Web Developer -> Inspector)
1. Click on the "Network" tab in the inspector
1. Select "All" content types
1. Refresh the page and wait for it to load
1. Right click on an item
1. Select "Save All as HAR"
1. Save it as `magento.har` in the current directory

### Get the HTML source
1. Go to the template URL in Firefox
1. Do a "File" -> "Save Page As"
1. Select "Web Page, HTML Only" as the Format
1. Save it as `magento.html` in the current directory

### Deploy the downloaded HTML to the theme

1. Run `bash ./deploy.sh` in the current directory.  

This has the following steps:

#### Clean up old theme
1. Clear the `output` directory: `find output/ -type f -exec rm {} \;`

#### Generate new theme
1. Run `python ./generate.py`

#### Copy theme to active theme directory
1. Copy the generated theme over: `rsync -av output/ ../theme_download/`