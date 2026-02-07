"""
Test Scraper Unit Logic
Tests internal scraper methods and logic
"""
import pytest
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scraper import Scraper, DataCleaner, ExtractionEngine, DiffTracker
import config


@pytest.mark.unit
@pytest.mark.scraper
class TestScraperURLHandling:
    """Test URL normalization and validation"""
    
    def test_normalize_url_removes_trailing_slash(self):
        """Test URL normalization removes trailing slash"""
        scraper = Scraper("https://example.com")
        normalized = scraper._normalize_url("https://example.com/")
        assert normalized == "https://example.com"
    
    def test_normalize_url_removes_query_params(self):
        """Test URL normalization removes query parameters"""
        scraper = Scraper("https://example.com")
        normalized = scraper._normalize_url("https://example.com/page?id=123")
        assert normalized == "https://example.com/page"
    
    def test_normalize_url_removes_fragments(self):
        """Test URL normalization removes fragments"""
        scraper = Scraper("https://example.com")
        normalized = scraper._normalize_url("https://example.com/page#section")
        assert normalized == "https://example.com/page"
    
    def test_normalize_url_preserves_path(self):
        """Test URL normalization preserves path"""
        scraper = Scraper("https://example.com")
        normalized = scraper._normalize_url("https://example.com/path/to/page")
        assert normalized == "https://example.com/path/to/page"


@pytest.mark.unit
@pytest.mark.scraper
class TestScraperFileDetection:
    """Test file detection logic"""
    
    def test_is_downloadable_file_pdf(self):
        """Test PDF file detection"""
        scraper = Scraper("https://example.com")
        assert scraper._is_downloadable_file("https://example.com/document.pdf") is True
    
    def test_is_downloadable_file_docx(self):
        """Test DOCX file detection"""
        scraper = Scraper("https://example.com")
        assert scraper._is_downloadable_file("https://example.com/document.docx") is True
    
    def test_is_downloadable_file_html(self):
        """Test HTML is not detected as downloadable"""
        scraper = Scraper("https://example.com")
        assert scraper._is_downloadable_file("https://example.com/page.html") is False
    
    def test_is_downloadable_file_no_extension(self):
        """Test URL without extension"""
        scraper = Scraper("https://example.com")
        assert scraper._is_downloadable_file("https://example.com/page") is False
    
    def test_is_downloadable_file_case_insensitive(self):
        """Test file detection is case insensitive"""
        scraper = Scraper("https://example.com")
        assert scraper._is_downloadable_file("https://example.com/document.PDF") is True


@pytest.mark.unit
@pytest.mark.scraper
class TestScraperFolderPath:
    """Test folder path creation"""
    
    def test_create_folder_path_simple(self):
        """Test simple folder path creation"""
        scraper = Scraper("https://example.com")
        path = scraper._create_folder_path("https://example.com/products")
        assert "example_com" in path
        assert "products" in path
    
    def test_create_folder_path_nested(self):
        """Test nested folder path creation"""
        scraper = Scraper("https://example.com")
        path = scraper._create_folder_path("https://example.com/products/category/item")
        assert "example_com" in path
        assert "products" in path
        assert "category" in path
        assert "item" in path
    
    def test_create_folder_path_root(self):
        """Test root URL folder path"""
        scraper = Scraper("https://example.com")
        path = scraper._create_folder_path("https://example.com")
        assert "example_com" in path
        assert "home" in path


@pytest.mark.unit
@pytest.mark.scraper
class TestScraperFingerprint:
    """Test fingerprint generation"""
    
    def test_generate_fingerprint_structure(self):
        """Test fingerprint has correct structure"""
        scraper = Scraper("https://example.com")
        fingerprint = scraper._generate_fingerprint()
        
        assert "viewport" in fingerprint
        assert "user_agent" in fingerprint
        assert "timezone_id" in fingerprint  # Changed from "timezone"
        assert "geolocation" in fingerprint
        assert "locale" in fingerprint
        assert "screen" in fingerprint
        assert "device_scale_factor" in fingerprint
        assert "has_touch" in fingerprint
    
    def test_generate_fingerprint_viewport_valid(self):
        """Test viewport has valid dimensions"""
        scraper = Scraper("https://example.com")
        fingerprint = scraper._generate_fingerprint()
        
        assert "width" in fingerprint["viewport"]
        assert "height" in fingerprint["viewport"]
        assert fingerprint["viewport"]["width"] > 0
        assert fingerprint["viewport"]["height"] > 0
    
    def test_generate_fingerprint_randomness(self):
        """Test fingerprints are randomized"""
        scraper = Scraper("https://example.com")
        fp1 = scraper._generate_fingerprint()
        fp2 = scraper._generate_fingerprint()
        
        # At least one field should be different (high probability)
        different = (
            fp1["viewport"] != fp2["viewport"] or
            fp1["user_agent"] != fp2["user_agent"] or
            fp1["timezone"] != fp2["timezone"]
        )
        assert different


@pytest.mark.unit
class TestDataCleaner:
    """Test DataCleaner utility methods"""
    
    def test_clean_text_removes_extra_spaces(self):
        """Test text cleaning removes extra spaces"""
        result = DataCleaner.clean_text("  Hello   World  ")
        assert result == "Hello World"
    
    def test_clean_text_handles_none(self):
        """Test text cleaning handles None"""
        result = DataCleaner.clean_text(None)
        assert result == ""
    
    def test_clean_number_extracts_float(self):
        """Test number extraction"""
        result = DataCleaner.clean_number("$99.99")
        assert result == 99.99
    
    def test_clean_number_handles_negative(self):
        """Test negative number extraction"""
        result = DataCleaner.clean_number("-$50.00")
        assert result == -50.0
    
    def test_clean_price_extracts_price(self):
        """Test price extraction"""
        result = DataCleaner.clean_price("USD $199.99")
        assert result == 199.99
    
    def test_clean_integer_extracts_int(self):
        """Test integer extraction"""
        result = DataCleaner.clean_integer("Quantity: 42 items")
        assert result == 42
    
    def test_clean_email_extracts_email(self):
        """Test email extraction"""
        result = DataCleaner.clean_email("Contact: john@example.com")
        assert result == "john@example.com"
    
    def test_clean_phone_formats_10_digit(self):
        """Test phone formatting for 10 digits"""
        result = DataCleaner.clean_phone("5551234567")
        assert result == "(555) 123-4567"
    
    def test_clean_phone_formats_11_digit(self):
        """Test phone formatting for 11 digits"""
        result = DataCleaner.clean_phone("15551234567")
        assert result == "+1 (555) 123-4567"
    
    def test_clean_url_resolves_relative(self):
        """Test URL resolution"""
        result = DataCleaner.clean_url("/about", base_url="https://example.com")
        assert result == "https://example.com/about"
    
    def test_clean_boolean_true_values(self):
        """Test boolean cleaning for true values"""
        assert DataCleaner.clean_boolean("true") is True
        assert DataCleaner.clean_boolean("yes") is True
        assert DataCleaner.clean_boolean("1") is True
        assert DataCleaner.clean_boolean("in stock") is True
    
    def test_clean_boolean_false_values(self):
        """Test boolean cleaning for false values"""
        assert DataCleaner.clean_boolean("false") is False
        assert DataCleaner.clean_boolean("no") is False
        assert DataCleaner.clean_boolean("0") is False
        assert DataCleaner.clean_boolean("out of stock") is False
    
    def test_clean_list_splits_by_comma(self):
        """Test list splitting"""
        result = DataCleaner.clean_list("apple, banana, orange")
        assert result == ["apple", "banana", "orange"]
    
    def test_clean_list_custom_separator(self):
        """Test list splitting with custom separator"""
        result = DataCleaner.clean_list("apple|banana|orange", separator="|")
        assert result == ["apple", "banana", "orange"]


@pytest.mark.unit
class TestDiffTracker:
    """Test DiffTracker methods"""
    
    def test_calculate_hash_consistent(self, test_db):
        """Test hash calculation is consistent"""
        tracker = DiffTracker(test_db)
        hash1 = tracker._calculate_hash("test content")
        hash2 = tracker._calculate_hash("test content")
        assert hash1 == hash2
    
    def test_calculate_hash_different_content(self, test_db):
        """Test different content produces different hash"""
        tracker = DiffTracker(test_db)
        hash1 = tracker._calculate_hash("content 1")
        hash2 = tracker._calculate_hash("content 2")
        assert hash1 != hash2
    
    def test_calculate_similarity_identical(self, test_db):
        """Test similarity calculation for identical text"""
        tracker = DiffTracker(test_db)
        similarity = tracker._calculate_similarity("test", "test")
        assert similarity == 1.0
    
    def test_calculate_similarity_different(self, test_db):
        """Test similarity calculation for different text"""
        tracker = DiffTracker(test_db)
        similarity = tracker._calculate_similarity("hello", "world")
        assert 0.0 <= similarity < 1.0
    
    def test_calculate_similarity_similar(self, test_db):
        """Test similarity calculation for similar text"""
        tracker = DiffTracker(test_db)
        similarity = tracker._calculate_similarity("hello world", "hello world!")
        assert 0.9 < similarity < 1.0


@pytest.mark.unit
@pytest.mark.scraper
class TestScraperConfiguration:
    """Test scraper configuration"""
    
    def test_scraper_initialization_defaults(self):
        """Test scraper initializes with defaults"""
        scraper = Scraper("https://example.com")
        assert scraper.start_url == "https://example.com"
        assert scraper.max_pages == config.SCRAPER['max_pages']
        assert scraper.max_depth == config.SCRAPER['max_depth']
    
    def test_scraper_initialization_custom_values(self):
        """Test scraper initializes with custom values"""
        scraper = Scraper(
            "https://example.com",
            max_pages=50,
            max_depth=5,
            concurrent_limit=10
        )
        assert scraper.max_pages == 50
        assert scraper.max_depth == 5
        assert scraper.concurrent_limit == 10
    
    def test_scraper_queue_initialization(self):
        """Test scraper queue is initialized"""
        scraper = Scraper("https://example.com")
        assert len(scraper.queue) > 0
        assert scraper.queue[0][0] == "https://example.com"
        assert scraper.queue[0][1] == 0  # depth
    
    def test_scraper_visited_set_initialization(self):
        """Test visited set is initialized"""
        scraper = Scraper("https://example.com")
        # Visited set may contain start URL or be empty depending on implementation
        assert isinstance(scraper.visited, set)
        assert len(scraper.visited) <= 1  # Either empty or contains start URL
