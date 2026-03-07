import unittest
from pathlib import Path


ROOT = Path("/mnt/e/Projects/pinf")


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


class WebWarningsFoundationTests(unittest.TestCase):
    def test_button_uses_cross_platform_shadow_helper(self) -> None:
        content = read("app_end/components/ui/Button.tsx")

        self.assertIn("buildShadowStyle", content)
        self.assertNotIn("...theme.shadows.small", content)

    def test_organic_card_normalizes_children_before_render(self) -> None:
        content = read("app_end/components/ui/OrganicCard.tsx")

        self.assertIn("const normalizedChildren", content)
        self.assertIn("{normalizedChildren}", content)

    def test_modal_disables_native_driver_on_web(self) -> None:
        content = read("app_end/components/ui/Modal.tsx")

        self.assertTrue("getUseNativeDriver" in content or "Platform.OS !== 'web'" in content)
        self.assertEqual(content.count("useNativeDriver: true"), 0)


if __name__ == "__main__":
    unittest.main()
