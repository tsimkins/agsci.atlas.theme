from Products.agCommon.browser.views import FolderView
from Products.agCommon.browser.views import SearchView as _SearchView
from agsci.atlas.theme.utilities import getPeopleBrains
from zope.component.hooks import getSite

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

                    # Get a list of Virtual Brains of people
                    v = getPeopleBrains(people_ids)

                    # Strip out non-existent brains
                    v = [x for x in v if x]

                    # Sort by Sort Key
                    v.sort(key=lambda x: x.sortKey())

                    return v

        return []

class SearchView(_SearchView):

    def page_title(self):
        path = self.request.form.get('path', None)

        if path:
            if isinstance(path, (list, tuple)):
                path = path[0]

            site = getSite()

            site_path = site.absolute_url_path() + '/'

            if path.startswith(site_path):
                path = path[len(site_path):]

                try:
                    o = site.restrictedTraverse(path)
                except:
                    pass
                else:
                    return u'Search %s' % o.Title()

        return u'Search'