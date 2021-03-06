from datetime import datetime
from tidylib import Tidy
from tidylib.tidy import BASE_OPTIONS
from urlparse import urlparse
from bs4 import BeautifulSoup # BeautifulSoup 4
from uuid import uuid4
import hashlib

import json
import os
import base64

LIB_NAMES = ['/usr/lib/libtidy.so.5']

BASE_OPTIONS['drop-empty-elements'] = 0

def tidy_document(text):
    return Tidy(LIB_NAMES).tidy_document(text, BASE_OPTIONS)

CDN_HOSTNAME = 'extension-ssl-45413.nexcesscdn.net'
ORIGINAL_URL = "https://extension.psu.edu/wild-bees-in-orchards"
OUTPUT = 'output'

ORIGINAL_HOSTNAME = urlparse(ORIGINAL_URL).netloc

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

datestamp = datetime.now().strftime('%Y%m%d%H%M%S')

changes = []

def remove_cdn(url):

    parsed_url = urlparse(url)

    hostname = parsed_url.netloc

    if CDN_HOSTNAME in hostname:
        url = url.replace(hostname, ORIGINAL_HOSTNAME)

    return url

def content_type_from_extension(url):

    extension = url.split('.')[-1]

    content_types = {
        'css' : 'text/css',
        'js' : 'application/javascript',
    }

    return content_types.get(extension, '')

def get_css_filename(url):
    m = hashlib.md5()
    m.update(url)
    return m.hexdigest()

for i in data['log']['entries']:

    # Request
    request = i.get('request')
    original_url_path = url = request.get('url')
    url = remove_cdn(original_url_path)
    parsed_url = urlparse(url)
    url_path = os.path.abspath(parsed_url.path)

    # Response
    response = i.get('response')
    headers = response.get('headers')

    # Content type
    try:
        content_type = filter(lambda x: x.get('name', '') == 'Content-Type', headers)[0].get('value', '')
    except IndexError:
        # No header
        content_type = content_type_from_extension(url)
    else:
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

        # Ignore per-product images
        if parsed_url.path.startswith('/media/catalog/product'):
            continue

        filename = os.path.basename(parsed_url.path)
        cksum = get_css_filename(parsed_url.path)

        if content_type in ['text/css', 'text/javascript', 'application/javascript']:
            filename = 'themecache-%s-%s' % (cksum, filename)
        if '.' in filename:
            download_path = '%s/%s' % (download_folder, filename)
            try:
                encoding = response['content'].get('encoding', 'utf-8')
            except:
                import pdb; pdb.set_trace()
            if encoding in ['base64',]:
                open(download_path, "wb").write(base64.b64decode(response['content']['text']))
            else:
                file_data = response['content']['text'].encode(encoding)
                file_data = file_data.replace(CDN_HOSTNAME, ORIGINAL_HOSTNAME)
                file_data = file_data.replace('https://extension.psu.edu/skin/frontend/extensions/default/css/images/', '../images/')
                open(download_path, "w").write(file_data)
            changes.append([original_url_path, download_path[len(OUTPUT)+1:]])
            changes.append([url_path, download_path[len(OUTPUT)+1:]])
            changes.append([parsed_url, download_path[len(OUTPUT)+1:]])
    else:
        try:
            html = response['content']['text']
        except KeyError:
            html = ''
            print "No HTML for %s" % url

changes.sort(key=lambda x: len(x[0]), reverse=True)

# Just use a static file for now.
html = open("magento.html", "r").read()

# Soup it
soup = BeautifulSoup(html, 'html.parser')
attrs = ['src', 'href']

# Included content
content_soup = BeautifulSoup("""
    <div id="plone" class="section">
        <div class="section">
            <div id="section-title" class="col col-md-16">
                <!-- Section title -->
            </div>
        </div>
        <div id="homepageimage-section" class="section">
            <div class="col col-md-16">
                <div id="homepageimage">
                    <!-- Homepage image -->
                </div>
            </div>
        </div>
        <div class="section">
            <div id="left-column" class="col col-md-4">
                <!-- Left Column -->
            </div>
            <div id="content-column" class="col col-md-8">
                <div class="product-name">
                    <h1 class="documentFirstHeading">
                        <!-- Page Title -->
                    </h1>
                </div>
                <p class="documentDescription short-description">
                    <!-- Page Description -->
                </p>
                <div class="leadimage">
                    <!-- Lead Image -->
                </div>
                <!-- Content Column -->
                <div id="content">
                    <!-- Content -->
                    <div id="content-text"></div>
                    <div id="content-core"></div>
                </div>
                <div id="center-column">
                    <!-- Center column -->
                </div>
            </div>
            <div id="right-column" class="col col-md-4">
                <!-- Right column -->
            </div>
        </div<
    </div>
""".strip(), 'html.parser').contents

# CSS and JS
head_soup = BeautifulSoup("""
    <link rel="stylesheet" type="text/css" href="featherlight/featherlight.min.css" />
    <link rel="stylesheet" type="text/css" href="plone/css/atlas.css" />
""".strip(), 'html.parser').contents

foot_soup = BeautifulSoup("""
    <script type="text/javascript" src="featherlight/featherlight.min.js"></script>
    <script type="text/javascript" src="plone/js/atlas.js"></script>
    <script type="text/javascript">

        function do_nothing() {
            return;
        }

        var IWD = {

            QuickView : {
                config: { enable : false }
            },

            PSU : {
                Processor :  {
                    createProductTabs : do_nothing,
                    init : do_nothing
                }
            },

            Featured : {
                Processor :  {
                    createProductTabs : do_nothing,
                    init : do_nothing
                }
            },

            Tabs : {
                 Processor :  {
                    createProductTabs : do_nothing,
                    init : do_nothing
                }
            },

            Signin : {
                init : do_nothing
            },

            StockNotification : {
                init : do_nothing
            },

            Publication : {
                Processor :  {
                    init : do_nothing
                }
            }

        }

    </script>
""".strip(), 'html.parser').contents

# Append CSS and body content
for i in head_soup:
    soup.find('head').append(i)

for i in content_soup:
    soup.find('div', attrs={'class' : 'main'}).append(i)

# Remove unused stuff
soup.find('div', attrs={'class' : 'global-site-notice noscript'}).extract()
soup.find('div', attrs={'class' : 'col-main'}).extract()
soup.find('div', attrs={'class' : 'col-right sidebar'}).extract()

# Fix src, href URLs
for el in soup.findAll():
    x = False
    for attr in attrs:
        src = el.get(attr, '')
        if src:
            src = remove_cdn(src)
            parsed_src = urlparse(src).path
            parsed_src_path = os.path.abspath(parsed_src)
            for (old_url, new_url) in changes:
                if old_url == parsed_src_path:
                    el[attr] = new_url
                    break

# Fix <title>
for t in soup.findAll('title'):
    t.contents = []

# Adjust body classes
for body in soup.findAll('body'):
    klass = body.get("class", '')
    for k in klass:
        if k.startswith('product-'):
            klass.remove(k)
    body['class'] = " ".join(klass)

# Append scripts to body
body = soup.find('body')

for i in foot_soup:
    body.append(i)

# Fix breadcrumb
for breadcrumbs in soup.findAll("div", attrs={'class' : 'breadcrumbs'}):
    for li in breadcrumbs.findAll("li", attrs={'class' : 'product'}):
        for strong in li.findAll("strong"):
            strong.contents = []

# Remove page-specific meta tags
for meta in soup.findAll('meta'):
    name = meta.get('name', '')
    property = meta.get('property', '')

    if name in ('robots', 'description') or property.startswith('og:') or name.startswith('twitter:'):
        _ = meta.extract()

# Remove script of type application/ld+json contents
for script in soup.findAll('script', attrs={'type' : 'application/ld+json'}):
    script.contents = []

# Remove "Customer Service" item from footer.
for footer in soup.findAll('div', attrs={'class' : 'footer'}):
    for item in footer.findAll('div', attrs={'class' : 'item'}):
        h3 = item.find('h3')
        if h3 and 'customer service' in h3.text.lower():
            _ = item.extract()

# Tidy
html, errors = tidy_document(unicode(soup))

# Manual replaces
replace_chars = [
    ('&lt;', '<'),
    ('&gt;', '>'),
    ('&amp;&amp;', '&&'),
]

for (_f, _t) in replace_chars:
    html = html.replace(_f,_t)

open('%s/theme.html' % OUTPUT, "w").write(html.encode('utf-8'))
