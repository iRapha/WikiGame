import wikipedia
from wikipedia.exceptions import DisambiguationError

visitedPages = {}

def visitAllLinks(pageName, depth=6):

    page = wikipedia.page(pageName)

    visitedPages[page.title] = page

    for oneLink in page.links:
        try:
            wikipedia.page(oneLink)
            print oneLink + ", child of " + pageName
        except Exception:
            continue

        visitAllLinks(oneLink, depth - 1)


visitAllLinks(u"Cat")

print visitedPages
