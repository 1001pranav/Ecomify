import { ProductStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';

/**
 * Builder Pattern - Constructs complex Product objects step by step
 * Allows creating products with variants, options, and images in a fluent interface
 */
export class ProductBuilder {
  private product: Prisma.ProductCreateInput;
  private variants: Array<Omit<Prisma.ProductVariantCreateInput, 'product'>> = [];
  private options: Array<Omit<Prisma.ProductOptionCreateInput, 'product'>> = [];
  private images: Array<Omit<Prisma.ProductImageCreateInput, 'product'>> = [];

  constructor(storeId: string, title: string) {
    this.product = {
      storeId,
      title,
      handle: this.generateHandle(title),
      status: ProductStatus.DRAFT,
    };
  }

  /**
   * Set description
   */
  setDescription(description: string): this {
    this.product.description = description;
    return this;
  }

  /**
   * Set vendor
   */
  setVendor(vendor: string): this {
    this.product.vendor = vendor;
    return this;
  }

  /**
   * Set product type
   */
  setProductType(productType: string): this {
    this.product.productType = productType;
    return this;
  }

  /**
   * Set tags
   */
  setTags(tags: string[]): this {
    this.product.tags = tags;
    return this;
  }

  /**
   * Set status
   */
  setStatus(status: ProductStatus): this {
    this.product.status = status;
    if (status === ProductStatus.ACTIVE && !this.product.publishedAt) {
      this.product.publishedAt = new Date();
    }
    return this;
  }

  /**
   * Set custom handle
   */
  setHandle(handle: string): this {
    this.product.handle = slugify(handle, { lower: true, strict: true });
    return this;
  }

  /**
   * Set SEO metadata
   */
  setSEO(title: string, description: string): this {
    this.product.seoTitle = title;
    this.product.seoDescription = description;
    return this;
  }

  /**
   * Add a product option (Color, Size, Material, etc.)
   */
  addOption(name: string, values: string[], position?: number): this {
    this.options.push({
      name,
      values,
      position: position ?? this.options.length,
    });
    return this;
  }

  /**
   * Add a variant
   */
  addVariant(variant: {
    title: string;
    price: number;
    sku?: string;
    barcode?: string;
    compareAtPrice?: number;
    costPrice?: number;
    inventoryQty?: number;
    trackInventory?: boolean;
    weight?: number;
    weightUnit?: string;
    options?: Record<string, string>;
    imageUrl?: string;
  }): this {
    this.variants.push({
      title: variant.title,
      price: variant.price,
      sku: variant.sku,
      barcode: variant.barcode,
      compareAtPrice: variant.compareAtPrice,
      costPrice: variant.costPrice,
      inventoryQty: variant.inventoryQty ?? 0,
      trackInventory: variant.trackInventory ?? true,
      weight: variant.weight,
      weightUnit: variant.weightUnit ?? 'kg',
      options: variant.options || {},
      imageUrl: variant.imageUrl,
    });
    return this;
  }

  /**
   * Add an image
   */
  addImage(url: string, altText?: string, position?: number): this {
    this.images.push({
      url,
      altText,
      position: position ?? this.images.length,
    });
    return this;
  }

  /**
   * Generate all variants from options
   * Example: If options are Color: [Red, Blue] and Size: [S, M],
   * this will generate 4 variants: Red-S, Red-M, Blue-S, Blue-M
   */
  generateVariantsFromOptions(basePrice: number): this {
    if (this.options.length === 0) {
      throw new Error('Cannot generate variants: No options defined');
    }

    // Get all combinations of option values
    const combinations = this.getOptionCombinations();

    this.variants = combinations.map((combination, index) => {
      const title = Object.values(combination).join(' / ');
      return {
        title,
        price: basePrice,
        inventoryQty: 0,
        trackInventory: true,
        weightUnit: 'kg',
        options: combination,
      };
    });

    return this;
  }

  /**
   * Build the final product object
   */
  build(): Prisma.ProductCreateInput {
    // Ensure at least one variant exists
    if (this.variants.length === 0) {
      this.addVariant({
        title: 'Default',
        price: 0,
      });
    }

    // Build the product with nested relations
    const productData: Prisma.ProductCreateInput = {
      ...this.product,
      variants: {
        create: this.variants,
      },
    };

    if (this.options.length > 0) {
      productData.options = {
        create: this.options,
      };
    }

    if (this.images.length > 0) {
      productData.images = {
        create: this.images,
      };
    }

    return productData;
  }

  /**
   * Generate URL-friendly handle from title
   */
  private generateHandle(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  /**
   * Get all combinations of option values
   */
  private getOptionCombinations(): Array<Record<string, string>> {
    const optionNames = this.options.map((opt) => opt.name);
    const optionValues = this.options.map((opt) => opt.values);

    const combinations: Array<Record<string, string>> = [];

    const generate = (index: number, current: Record<string, string>) => {
      if (index === optionNames.length) {
        combinations.push({ ...current });
        return;
      }

      const optionName = optionNames[index];
      const values = optionValues[index];

      for (const value of values) {
        current[optionName] = value;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  }
}

/**
 * Factory Pattern - Creates ProductBuilder instances
 */
export class ProductBuilderFactory {
  /**
   * Create a simple product builder
   */
  static createSimpleProduct(storeId: string, title: string, price: number): ProductBuilder {
    return new ProductBuilder(storeId, title).addVariant({
      title: 'Default',
      price,
    });
  }

  /**
   * Create a product with variants
   */
  static createProductWithVariants(storeId: string, title: string): ProductBuilder {
    return new ProductBuilder(storeId, title);
  }

  /**
   * Create a product from CSV data
   */
  static createFromCSV(storeId: string, csvData: any): ProductBuilder {
    const builder = new ProductBuilder(storeId, csvData.title);

    if (csvData.description) {
      builder.setDescription(csvData.description);
    }

    if (csvData.vendor) {
      builder.setVendor(csvData.vendor);
    }

    if (csvData.productType) {
      builder.setProductType(csvData.productType);
    }

    if (csvData.tags) {
      const tags = csvData.tags.split(',').map((tag: string) => tag.trim());
      builder.setTags(tags);
    }

    // Add default variant
    builder.addVariant({
      title: csvData.variantTitle || 'Default',
      price: parseFloat(csvData.price || '0'),
      sku: csvData.sku,
      barcode: csvData.barcode,
      inventoryQty: parseInt(csvData.inventoryQty || '0', 10),
    });

    return builder;
  }
}
