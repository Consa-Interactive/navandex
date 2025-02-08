import axios from "axios";
import { load } from "cheerio";

interface ScraperResult {
  title?: string;
  image?: string;
  error?: string;
}

// Helper function to validate image URL format
function isValidImageFormat(url: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const lowercaseUrl = url.toLowerCase();
  return validExtensions.some(ext => lowercaseUrl.endsWith(ext));
}

// Helper function to find product images
function findProductImages($: ReturnType<typeof load>): string[] {
  const images: string[] = [];

  // Priority selectors for product images
  const selectors = [
    // OpenGraph and meta tags
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="product:image"]',
    
    // Common product image selectors
    '.product-image img',
    '.product-gallery img',
    '.product__image img',
    '#product-image',
    '[data-product-image]',
    '[data-product-photo]',
    
    // Fallback to any image that might be a product image
    'img[src*="product"]',
    'img[src*="products"]',
    '.gallery img',
  ];

  // Try each selector
  for (const selector of selectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content && isValidImageFormat(content)) {
        images.push(content);
      }
    } else {
      $(selector).each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && isValidImageFormat(src)) {
          images.push(src);
        }
      });
    }

    // If we found valid images, no need to continue
    if (images.length > 0) break;
  }

  return images;
}

async function scrapeProductPage(url: string): Promise<ScraperResult> {
  try {
    // Fetch the HTML content of the URL
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    });

    // Load the HTML into Cheerio
    const $ = load(html);

    // Extract the title from the <title> tag or meta tags
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="title"]').attr("content") ||
      $("title").text();

    // Find product images
    const images = findProductImages($);
    const image = images.length > 0 ? images[0] : undefined;

    // Return the result
    return { title, image };
  } catch (error) {
    console.error("Error scraping the page:", error);
    return {
      error: "Failed to scrape the page. Please check the URL and try again.",
    };
  }
}

export default scrapeProductPage;
