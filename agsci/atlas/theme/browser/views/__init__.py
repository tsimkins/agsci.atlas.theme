from DateTime import DateTime
from plone.memoize import ram
from time import time

import base64
import json
import logging
import pickle
import urllib2

from zope.component.hooks import getSite
from Products.CMFCore.utils import getToolByName
from Products.ZCatalog.CatalogBrains import AbstractCatalogBrain

from Products.agCommon.browser.views import FolderView
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
        v = u"""
                    <img class="%s" src="%s/@@images/leadimage/leadimage" alt="%s" />
                """.strip()
        return v % (kwargs.get('css_class', ''), self.url, self.alt)

@ram.cache(vbf_timeout_cachekey)
def VirtualBrainFactory(user_id):

    url = 'http://cms.extension.psu.edu/directory/%s/@@api/json?bin=False&brain=True' % user_id
    url = 'http://agplonesrv.ag.psu.edu/atlas-test/directory/%s/@@api/json?bin=False&brain=True' % user_id

    try:
        data = json.loads(urllib2.urlopen(url).read())
    except urllib2.HTTPError:
        data = {}

    logger = logging.getLogger('agsci.atlas.theme')

    logger.info("Lookup %s, found %r" % (user_id, not not data))

    class VirtualBrain(AbstractCatalogBrain):

        def getURL(self):
            return self.data.get('plone_url', '')

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
                return leadimage_field(self.getURL(), self.Title)

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
        brain_data = pickle.loads(brain_data)
        return VirtualBrain(brain_data)

    return None


class PeopleCollection(FolderView):

    # This catches if we're trying for a people collection, and grabs people
    # from the API on cms.extension.psu.edu
    def virtualFolderContents(self):

        # If we're a collection
        if self.context.Type() in ['Collection',]:

            # Grab the query
            query = self.context.buildQuery()

            # If we're looking at the Person type
            if 'Person' in query.get('Type', []):

                # Grab the ids of the people we're looking for
                people_ids = query.get('getId', {}).get('query', [])

                # If we have people_ids:
                if people_ids:

                    # Get a list of Virtual Brains
                    v = [VirtualBrainFactory(x) for x in people_ids]

                    # Strip out non-existent brains
                    v = [x for x in v if x]

                    # Sort by Sort Key
                    v.sort(key=lambda x: x.sortKey())

                    return v

        return []