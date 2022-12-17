import { CategoryItem } from '../exemplars/exemplar.factory';

abstract class Category {
  items: CategoryItem[];

  constructor() {
    this.items = [];
  }

  async addItem(item: CategoryItem): Promise<void> {
    this.items.push(item);
  }

  async getItems(): Promise<CategoryItem[]> {
    return this.items;
  }

  async removeItem(item: CategoryItem): Promise<void> {
    this.items = this.items.filter((i) => i !== item);
  }

  async removeAllItems(): Promise<void> {
    this.items = [];
  }

  async getItemByName(name: string): Promise<CategoryItem | undefined> {
    return this.items.find((i) => i.name === name);
  }

  async getItemByPrice(price: number): Promise<CategoryItem | undefined> {
    return this.items.find((i) => i.price === price);
  }

  async getItemByPriceRange(
    min: number,
    max: number,
  ): Promise<CategoryItem | undefined> {
    return this.items.find((i) => i.price >= min && i.price <= max);
  }
}

class ClouthCategory extends Category {}
class ShoesCategory extends Category {}
class TShirtCategory extends Category {}

export class CategoryFactory {
  public static categories = {
    clouth: ClouthCategory,
    shoes: ShoesCategory,
    tshirt: TShirtCategory,
  };

  public static categoryKeys: Readonly<{
    clouth: string;
    shoes: string;
    tshirt: string;
  }> = {
    clouth: 'clouth',
    shoes: 'shoes',
    tshirt: 'tshirt',
  };

  public create(category: string): Category {
    const CategoryType =
      CategoryFactory.categories[category] || CategoryFactory.categories.clouth;
    return new CategoryType();
  }
}
