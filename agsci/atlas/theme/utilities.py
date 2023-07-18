from plone.memoize import ram
from time import time

import json
import logging
import pickle
import urllib2

from base64 import b64decode
from zope.component.hooks import getSite
from Products.CMFCore.utils import getToolByName
from Products.ZCatalog.CatalogBrains import AbstractCatalogBrain

from collective.contentleadimage.config import IMAGE_FIELD_NAME

VBF_TIMEOUT = 600

def vbf_timeout_cachekey(method, user_id):
    return (method, user_id, time() // VBF_TIMEOUT)

class leadimage_field(object):

    def __init__(self, url, alt=''):
        self.url = url
        self.alt = alt

    def get_size(self):
        return True

    def get(self, context):
        return self

    def tag(self, *args, **kwargs):
        if self.url:
            v = u"""
                        <img class="%s" src="%s/@@images/leadimage/leadimage" alt="%s" />
                    """.strip()
            return v % (kwargs.get('css_class', ''), self.url, self.alt)

        return ''

@ram.cache(vbf_timeout_cachekey)
def VirtualBrainFactory(user_id):

    url = 'http://cms.extension.psu.edu/directory/%s/@@api/json?bin=False&brain=True' % user_id

    try:
        data = json.loads(urllib2.urlopen(url).read())
    except urllib2.HTTPError:
        data = {}

    # Skip inactive (not "published") people.
    if not data.get('visibility', None) in ('Catalog',):
        return None

    logger = logging.getLogger('agsci.atlas.theme')

    logger.info("Lookup %s, found %r" % (user_id, not not data))

    class VirtualBrain(AbstractCatalogBrain):

        def getPloneURL(self):
            return self.data.get('plone_url', '')

        def getURL(self):
            url = self.data.get('magento_url', '')

            if url:
                return u'https://extension.psu.edu/%s' % url

        def getObject(self):
            return self

        @property
        def Type(self):
            return self.data.get('product_type', '')

        def pretty_title_or_id(self):
            return self.Title

        @property
        def portal_type(self):
            return 'FSDPerson'

        def zip_code(self):
            return self.data.get('zip', '')

        def getJobTitles(self):
            return self.data.get('person_job_titles', [])

        def getEmail(self):
            return self.data.get('email_address', '')

        def getOfficePhone(self):
            return self.data.get('phone', '')

        def getField(self, field_name):

            if field_name in ['image', IMAGE_FIELD_NAME]:
                if self.hasContentLeadImage():
                    return leadimage_field(self.getPloneURL(), self.Title)
                else:
                    return leadimage_field(None, self.Title)

        def hasContentLeadImage(self):
            return not not self.data.get(u'has_lead_image', False)

        def sortKey(self):
            return tuple([
                self.data.get(x, '') for x in ['last_name', 'first_name', 'middle_name']
            ])

    # Setting record schema.  Required for brain, and lifted directly from
    # Products/ZCatalog/Catalog.py
    site = getSite()
    portal_catalog = getToolByName(site, 'portal_catalog')

    catalog = portal_catalog._catalog
    scopy = catalog.schema.copy()

    schema_len = len(catalog.schema.keys())

    scopy['data_record_id_'] = schema_len
    scopy['data_record_score_'] = schema_len + 1
    scopy['data_record_normalized_score_'] = schema_len + 2

    VirtualBrain.__record_schema__ = scopy

    VirtualBrain.data = dict(data)

    brain_data = data.get('brain', None)

    if brain_data:
        brain_data = b64decode(brain_data)
        brain_data = pickle.loads(brain_data)
        return VirtualBrain(brain_data)

    return None

def getPeopleBrains(people_ids):

    # If we're passed a string, listify it
    if isinstance(people_ids, (str, unicode)):
        people_ids = [people_ids,]

    # If we're passed something else, it's bad data
    if not isinstance(people_ids, (list, tuple)):
        return []

    # Get virtual brains
    v = [VirtualBrainFactory(x) for x in people_ids]

    # Strip out non-existent brains
    v = [x for x in v if x]

    # Sort by Sort Key
    v.sort(key=lambda x: x.sortKey())

    # Return brains
    return v
