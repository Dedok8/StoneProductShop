import Product from "../models/product/Product.mjs";
import MongooseCRUDManager from "./MongooseCRUDManager.mjs";
import { sanitizeProductInput } from "../validators/product/productSanitize.mjs";
import { buildProductFilter } from "../validators/product/productFilter.mjs";
import { isValidObjectId } from "../validators/helpers.mjs";
import mongoose from "mongoose";

class ProductsDBService extends MongooseCRUDManager {
  /**
   * Отримати відфільтрований список продуктів з пагінацією
   * @param {Object} user - користувач (для перевірки прав)
   * @param {Object} queryParams - параметри запиту
   * @returns {Object} - об'єкт з продуктами та метаданими
   */
  async getFilteredProducts(user, queryParams) {
    const filters = buildProductFilter(queryParams);

    // Якщо залогінений користувач - продавець, він бачить лише свої товари
    if (user && user.role === "seller") {
      filters.seller = user.id;
    }

    const page = parseInt(queryParams.page, 10) || 1;
    const perPage = parseInt(queryParams.perPage, 10) || 5;
    const skip = (page - 1) * perPage;

    let sort = {};
    if (queryParams.sort) {
      const [field, order] = String(queryParams.sort).split(":");
      sort[field] = order === "desc" || order === "-1" ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }

    const [productsList, totalCount] = await Promise.all([
      this.getList(filters, null, ["seller"], {
        sort,
        skip,
        limit: perPage,
      }),
      this.count(filters),
    ]);

    return {
      products: productsList,
      totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
    };
  }

  /**
   * Отримати дані для форми редагування продукту
   * @param {string} productId - ID продукту (опціонально)
   * @returns {Object} - дані для форми
   */
  async getProductFormData(productId = null) {
    let product = null;
    if (productId) {
      if (!isValidObjectId(productId)) {
        throw new Error("Invalid product id");
      }
      product = await this.getById(productId, ["seller"]);
    }

    // Отримати сервіси для отримання продавців
    const TypesDBService = (await import("./TypesDBService.mjs")).default;
    const UsersDBService = (await import("./UsersDBService.mjs")).default;

    const sellerType = await TypesDBService.findOne({ role: "seller" });
    const sellers = sellerType
      ? await UsersDBService.getList({ type: sellerType._id })
      : [];

    return { product, sellers };
  }

  /**
   * Створити або оновити продукт
   * @param {Object} productData - дані продукту
   * @param {Object} user - користувач
   * @param {string} productId - ID продукту для оновлення (опціонально)
   * @returns {Object} - створений/оновлений продукт
   */
  async createOrUpdateProduct(productData, user, productId = null) {
    // Валідація та санітізація
    const sanitizedData = sanitizeProductInput(productData);
    this.validateAndConvertIds(sanitizedData);

    if (productId) {
      // Оновлення існуючого продукту
      if (!isValidObjectId(productId)) {
        throw new Error("Invalid product id");
      }

      await this.checkEditPermissions(productId, user);
      return await this.update(productId, sanitizedData);
    } else {
      // Створення нового продукту
      sanitizedData.owner = user.id;
      return await this.create(sanitizedData);
    }
  }

  /**
   * Видалити продукт з перевіркою прав
   * @param {string} productId - ID продукту
   * @param {Object} user - користувач
   */
  async deleteProduct(productId, user) {
    if (!isValidObjectId(productId)) {
      throw new Error("Invalid product id");
    }

    const existing = await this.getById(productId);
    if (!existing) {
      throw new Error("Product not found");
    }

    this.checkDeletePermissions(existing, user);
    await this.deleteById(productId);
  }

  /**
   * Валідація та конвертація ObjectId
   * @param {Object} data - дані продукту
   */
  validateAndConvertIds(data) {
    // Конвертація seller в ObjectId
    if (data.seller && typeof data.seller === "string") {
      if (mongoose.Types.ObjectId.isValid(data.seller)) {
        data.seller = new mongoose.Types.ObjectId(data.seller);
      } else {
        throw new Error("Invalid seller id");
      }
    }
  }

  /**
   * Перевірка прав на редагування продукту
   * @param {string} productId - ID продукту
   * @param {Object} user - користувач
   */
  async checkEditPermissions(productId, user) {
    const existing = await this.getById(productId);
    if (!existing) {
      throw new Error("Product not found");
    }

    if (user.role === "admin") {
      return; // Admin може редагувати все
    }

    if (user.role === "seller") {
      if (existing.owner?.toString() !== user.id) {
        throw new Error("Forbidden: You are not the owner");
      }
      return;
    }

    throw new Error("Forbidden: Only admins or sellers can edit products");
  }

  /**
   * Перевірка прав на видалення продукту
   * @param {Object} product - продукт
   * @param {Object} user - користувач
   */
  checkDeletePermissions(product, user) {
    if (user.role === "admin") {
      return; // Admin може видаляти все
    }

    if (user.role === "seller") {
      if (product.owner?.toString() !== user.id) {
        throw new Error("Forbidden: You are not the owner");
      }
      return;
    }

    throw new Error("Forbidden: Only admins or sellers can delete products");
  }

  // Наслідуємо базові методи
  async getList(
    filters = {},
    projection = null,
    populateFields = [],
    options = {}
  ) {
    return await super.getList(filters, projection, populateFields, options);
  }
}

export default new ProductsDBService(Product);
