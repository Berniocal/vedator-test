#!/usr/bin/env python3
from __future__ import annotations

import html

import review_locale_quality_v4 as base


def normalized_urls(value: str) -> list[str]:
    # BeautifulSoup serializes query separators as &amp;; this is semantically
    # identical to & in the feed. Compare after decoding HTML entities.
    return base.URL_RE.findall(html.unescape(value or ''))


base.urls = normalized_urls

if __name__ == '__main__':
    base.main()
