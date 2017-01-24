from tidylib import Tidy
from tidylib.tidy import BASE_OPTIONS
from urlparse import urlparse
from BeautifulSoup import BeautifulSoup
from uuid import uuid4

import json
import os
import base64
import urllib2

LIB_NAMES = ['/usr/local/lib/libtidy.so.5']

BASE_OPTIONS['drop-empty-elements'] = 0

def tidy_document(text):
    return Tidy(LIB_NAMES).tidy_document(text, BASE_OPTIONS)

ORIGINAL_URL = "http://psuextension-attr.iwdfun.com/extension/marketing-to-professional-chefs"
OUTPUT = 'output'

download_types = {
    'application/javascript' : 'js',
    'image/gif' : 'images',
    'image/png' : 'images',
    'text/css' : 'css',
    'text/javascript' : 'js',
}

html = ''

har = open("magento.har", "r").read()
har = har.replace('/img/', '/images/')

data = json.loads(har)

changes = []

for i in data['log']['entries']:

    # Request
    request = i.get('request')
    url = request.get('url')
    parsed_url = urlparse(url)
    url_path = os.path.abspath(parsed_url.path)
    
    # Response
    response = i.get('response')
    headers = response.get('headers')

    # Content type
    content_type = filter(lambda x: x.get('name', '') == 'Content-Type', headers)[0].get('value', '')
    content_type = content_type.split(';')[0]

    download_folder = OUTPUT
    download_type = download_types.get(content_type, '')

    if download_type:
        download_folder = '%s/%s' % (OUTPUT, download_type)

    try:
        os.makedirs(download_folder)
    except OSError:
        #already exists
        pass
    
    if content_type not in ['text/html']:
        filename = os.path.basename(parsed_url.path)
        if  content_type in ['text/css', 'text/javascript', 'application/javascript']:
            filename = 'themecache-%s-%s' % (uuid4(), filename)
        if '.' in filename:
            download_path = '%s/%s' % (download_folder, filename)
            try:
                encoding = response['content'].get('encoding', 'utf-8')
            except:
                import pdb; pdb.set_trace()
            if encoding in ['base64',]:
                open(download_path, "wb").write(base64.b64decode(response['content']['text']))
            else:
                open(download_path, "w").write(response['content']['text'].encode(encoding))
            changes.append([url_path, download_path[len(OUTPUT)+1:]])
    else:
        html = response['content']['text']

changes.sort(key=lambda x: len(x[0]), reverse=True)


# Get the HTML directly from the page
original_html = urllib2.urlopen(ORIGINAL_URL).read()

# Run it through tidy
#html, errors = tidy_document(original_html)

# Soup it
soup = BeautifulSoup(original_html)
attrs = ['src', 'href']

# Included content
content_soup = BeautifulSoup("""
    <div id="plone" class="section">
        <div class="section">
            <div id="section-title" class="col col-md-12">
                <!-- Section title -->
            </div>
        </div>
        <div id="homepageimage-section" class="section">
            <div class="col col-md-12">
                <div id="homepageimage">
                    <!-- Homepage image -->
                </div>
            </div>
        </div>
        <div class="section">
            <div id="left-column" class="col col-md-2">
                <!-- Left Column -->
            </div>
            <div id="content-column" class="col col-md-10">
                <h1 class="documentFirstHeading">
                    <!-- Page Title -->
                </h1>
                <p class="documentDescription">
                    <!-- Page Description -->
                </p>
                <div class="leadimage">
                    <!-- Lead Image -->
                </div>
                <!-- Content Column -->
                <div id="content">
                    <!-- Content -->
                </div>
                <div id="center-column">
                    <!-- Center column -->
                </div>
            </div>
            <div id="right-column" class="col col-md-2">
                <!-- Right column -->
            </div>
        </div<
    </div>
""".strip()).contents

# CSS and JS
head_soup = BeautifulSoup("""
    <link rel="stylesheet" type="text/css" href="plone/css/atlas.css" />
    <script type="text/javascript" src="plone/js/atlas.js">
""".strip()).contents

# Append CSS and body content
for i in head_soup:
    soup.find('head').append(i)

for i in content_soup:
    soup.find('div', attrs={'class' : 'main'}).append(i)

# Remove unused stuff
soup.find('div', attrs={'class' : 'col-main'}).extract()
soup.find('div', attrs={'class' : 'col-right sidebar'}).extract()

# Fix src, href URLs
for el in soup.findAll():
    for attr in attrs:
        src = el.get(attr, '')
        if src:
            parsed_src = urlparse(src).path
            parsed_src_path = os.path.abspath(parsed_src)
            for (old_url, new_url) in changes:
                if old_url == parsed_src_path:
                    el[attr] = new_url
                    break
# Tidy again
html, errors = tidy_document(repr(soup))

# Manual replaces
replace_chars = [
    ('&lt;', '<'),
    ('&gt;', '>'),
    ('&amp;&amp;', '&&'),
]

for (_f, _t) in replace_chars:
    html = html.replace(_f,_t)

open('%s/theme.html' % OUTPUT, "w").write(html)
