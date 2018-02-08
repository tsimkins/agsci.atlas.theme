from zope.viewlet.interfaces import IViewletManager
from Products.CMFPlone.interfaces import IPloneSiteRoot
from Products.Five.viewlet.manager import ViewletManagerBase
from Products.agCommon.browser.viewlets import AgCommonViewlet, MultiSearchViewlet
from Products.agCommon.browser.viewlets import ContributorsViewlet as _ContributorsViewlet
from plone.app.layout.viewlets.common import PathBarViewlet as _PathBarViewlet
from plone.memoize.view import memoize

from agsci.atlas.theme.utilities import getPeopleBrains

from ..interfaces import ISearchSection

try:
    from zope.app.component.hooks import getSite
except ImportError:
    from zope.component.hooks import getSite

class AtlasViewletManager(ViewletManagerBase):
    # Viewlet manager class
    pass

class IAtlasViewletManager(IViewletManager):
    # Viewlet manager interface
    pass

class AtlasViewlet(AgCommonViewlet):
    pass

class PathBarViewlet(_PathBarViewlet, AgCommonViewlet):

    @property
    def navigation_root_url(self):
        return self.portal_state.navigation_root_url()

class ContributorsViewlet(_ContributorsViewlet):

    def getPeopleResults(self, peopleList):
        return getPeopleBrains(peopleList)

    def getPersonInfo(self, brain):
        job_titles = brain.getJobTitles()

        return {
            'name' : brain.Title,
            'title' : job_titles and job_titles[0] or '',
            'url' : brain.getURL(),
            'phone' : brain.getOfficePhone(),
            'email' : brain.getEmail(),
            'image' : brain.getField('image'),
            'tag' : brain.getField('image').tag
        }

class SearchViewlet(MultiSearchViewlet):

    @property
    @memoize
    def section(self):

        for o in self.context.aq_chain:

            if ISearchSection.providedBy(o):
                return o

            elif IPloneSiteRoot.providedBy(o):
                return None
        
        return None
    
    def show(self):
        return not not self.section
    
    def search_title(self):
        o = self.section
        
        if o:
            return u'Search %s...' % o.Title()

    def section_path(self):
        o = self.section
        
        if o:
            return '/'.join(o.getPhysicalPath())