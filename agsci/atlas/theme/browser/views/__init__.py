from Products.agCommon.browser.views import FolderView
from agsci.atlas.theme.utilities import getPeopleBrains

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