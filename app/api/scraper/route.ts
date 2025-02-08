import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Helper function to validate image URL format
function isValidImageFormat(url: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const lowercaseUrl = url.toLowerCase();
  return validExtensions.some(ext => lowercaseUrl.endsWith(ext));
}

// Helper function to extract product information
async function scrapeProduct(url: string) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Initialize product data
    const productData = {
      title: "",
      images: [] as string[],
    };

    // Common selectors for product titles
    const titleSelectors = [
      'meta[property="og:title"]',
      'meta[name="title"]',
      'h1',
      '[data-testid="product-title"]',
      '.product-title',
      '.product-name',
      '[itemprop="name"]',
      '#product-name',
      '.title',
    ];

    // Try to find title using common selectors
    for (const selector of titleSelectors) {
      const title = selector.startsWith('meta') 
        ? $(selector).attr('content')
        : $(selector).first().text().trim();
      if (title) {
        productData.title = title;
        break;
      }
    }

    // Common selectors for product images
    const imageSelectors = [
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

    // Try to find images using common selectors
    for (const selector of imageSelectors) {
      let images: string[] = [];
      
      if (selector.startsWith('meta')) {
        const content = $(selector).attr('content');
        if (content) {
          const absoluteUrl = new URL(content, url).href;
          if (isValidImageFormat(absoluteUrl)) {
            images = [absoluteUrl];
          }
        }
      } else {
        images = $(selector)
          .map((_, el) => {
            const src = $(el).attr("src") ||
                       $(el).attr("data-src") ||
                       $(el).attr("data-lazy-src");
            return src ? new URL(src, url).href : null;
          })
          .get()
          .filter(url => url && isValidImageFormat(url));
      }

      if (images.length > 0) {
        productData.images = images;
        break;
      }
    }

    return productData;
  } catch (error) {
    console.error("Error scraping product:", error);
    throw new Error("Failed to scrape product information");
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    const productData = await scrapeProduct(url);

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error in scraper API:", error);
    return NextResponse.json(
      { error: "Failed to scrape product information" },
      { status: 500 }
    );
  }
}
