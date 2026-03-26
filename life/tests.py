from django.test import SimpleTestCase

from .pattern_catalog import parse_life_catalog


class PatternCatalogParserTests(SimpleTestCase):
    def test_parser_splits_aliases_and_description(self):
        catalog = parse_life_catalog(
            """
Glossary Title
-------------

mango, dove, cigar - a compact still life
 .**.. (p1)
 *..*.
 .*..*
 ..**.
"""
        )

        self.assertEqual(
            catalog,
            [
                {
                    "name": "mango (dove, cigar)",
                    "description": "a compact still life",
                    "points": [
                        {"x": 1, "y": 0},
                        {"x": 2, "y": 0},
                        {"x": 0, "y": 1},
                        {"x": 3, "y": 1},
                        {"x": 1, "y": 2},
                        {"x": 4, "y": 2},
                        {"x": 2, "y": 3},
                        {"x": 3, "y": 3},
                    ],
                }
            ],
        )

    def test_parser_joins_wrapped_descriptions(self):
        catalog = parse_life_catalog(
            """
blinker ship - an object which travels while growing larger by
  leaving an increasing trail of blinkers.
 ... (p2)
 ***
 ...
"""
        )

        self.assertEqual(catalog[0]["name"], "blinker ship")
        self.assertEqual(
            catalog[0]["description"],
            "an object which travels while growing larger by leaving an increasing trail of blinkers.",
        )


class PatternCatalogViewTests(SimpleTestCase):
    def test_catalog_endpoint_returns_patterns(self):
        response = self.client.get("/life/api/catalog/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(
            any(pattern["name"] == "mango (dove, cigar)" for pattern in payload)
        )
