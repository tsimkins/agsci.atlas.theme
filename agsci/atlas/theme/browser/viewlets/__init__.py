from zope.viewlet.interfaces import IViewletManager
from Products.Five.viewlet.manager import ViewletManagerBase
from Products.agCommon.browser.viewlets import AgCommonViewlet
from plone.app.layout.viewlets.common import PathBarViewlet as _PathBarViewlet

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

