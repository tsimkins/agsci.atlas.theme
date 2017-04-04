from DateTime import DateTime
from plone.memoize import ram
from time import time

import json
import logging
import urllib2

from Products.agCommon.browser.views import FolderView

vpbf_timeout = 600

def vpbf_timeout_cachekey(method, user_id):
    return (method, user_id, time() // vpbf_timeout)

@ram.cache(vpbf_timeout_cachekey)
def VirtualPersonBrainFactory(user_id):

    url = 'http://cms.extension.psu.edu/directory/%s/@@api/json?bin=False' % user_id

    try:
        data = json.loads(urllib2.urlopen(url).read())
    except urllib2.HTTPError:
        data = {}

    logger = logging.getLogger('agsci.atlas.theme')

    logger.info("Lookup %s, found %r" % (user_id, not not data))

    return VirtualBrain(data)


class VirtualBrain(object):

    def __init__(self, json={}):
        self.json = json

        for (k,v) in json.iteritems():
            setattr(self, k, v)

    def CreationDate(self):
        if hasattr(self, 'updated_at'):
            return DateTime(self.updated_at)
        return DateTime()

    def Creator(self):
        return ''

    def ModificationDate(self):
        return self.CreationDate()

    def EffectiveDate(self):
        return self.CreationDate()

    @property
    def Title(self):
        return self.name

    @property
    def Description(self):
        return u''

    def getURL(self):
        return getattr(self, 'plone_url', '')

    @property
    def Type(self):
        return getattr(self, 'product_type', '')

    def absolute_url(self):
        return self.getURL()

    def getId(self):
        return getattr(self, 'short_name', '')

    def getObject(self):
        return self

    @property
    def hasContentLeadImage(self):
        return False

    def has_lead_image(self):
        return False

    @property
    def portal_type(self):
        return 'FSDPerson'

    def pretty_title_or_id(self):
        return getattr(self, 'name', '')

    def review_state(self):
        return getattr(self, 'plone_status', '')

    def zip_code(self):
        return getattr(self, 'zip', '')

    def getJobTitles(self):
        return getattr(self, 'person_job_titles', [])

    def getEmail(self):
        return getattr(self, 'email_address', '')

    def getOfficePhone(self):
        return getattr(self, 'phone', '')

    def sortKey(self):
        return tuple([
            getattr(self, x, '') for x in ['last_name', 'first_name', 'middle_name']
        ])


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
                    v = [VirtualPersonBrainFactory(x) for x in people_ids]

                    # Sort by Sort Key
                    v.sort(key=lambda x: x.sortKey())

                    return v

        return []