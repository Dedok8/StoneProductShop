import User from '../models/user/User.mjs'
import MongooseCRUDManager from './MongooseCRUDManager.mjs'
import { ROLES } from '../constants/roles.mjs'
import { buildUserFilter } from '../validators/user/userFilter.mjs'
import { isValidObjectId } from '../validators/helpers.mjs'
import { sanitizeUserInput } from '../validators/user/userSanitize.mjs'

class UsersDBService extends MongooseCRUDManager {
  /**
   * Отримати відфільтрований список користувачів
   * @param {Object} queryParams - параметри запиту
   * @returns {Array} - список користувачів
   */
  async getFilteredUsers(queryParams) {
    const filters = buildUserFilter(queryParams)
    return await this.getList(filters)
  }

  /**
   * Отримати дані для форми створення/редагування користувача
   * @param {string} userId - ID користувача (опціонально)
   * @returns {Object} - дані для форми
   */
  async getUserFormData(userId = null) {
    let user = null
    if (userId) {
      if (!isValidObjectId(userId)) {
        throw new Error('Invalid user id')
      }
      user = await this.getById(userId)
    }

    // Отримати сервіс типів
    const TypesDBService = (await import('./TypesDBService.mjs')).default
    const types = await TypesDBService.getList()

    return { user, types }
  }

  /**
   * Створити або оновити користувача
   * @param {Object} userData - дані користувача
   * @param {string} userId - ID користувача для оновлення (опціонально)
   * @returns {Object} - створений/оновлений користувач
   */
  async createOrUpdateUser(userData, userId = null) {
    const sanitizedData = sanitizeUserInput(userData)

    // Map 'role' to 'type' if coming from frontend as 'role'
    if (userData.role || userData.type) {
      sanitizedData.type = userData.type || userData.role
    }

    if (userId) {
      if (!isValidObjectId(userId)) {
        throw new Error('Invalid user id')
      }
      return await this.update(userId, sanitizedData)
    } else {
      return await this.createUser(sanitizedData)
    }
  }

  /**
   * Видалити користувача з перевіркою прав
   * @param {string} userId - ID користувача
   */
  async deleteUser(userId) {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid user id')
    }

    // Prevent deletion of sellers and admins
    const user = await this.findUser({ _id: userId })
    if (user) {
      const TypesDBService = (await import('./TypesDBService.mjs')).default
      const type = await TypesDBService.findOne({ _id: user.type })
      if (type && (type.role === ROLES.SELLER || type.role === ROLES.ADMIN)) {
        throw new Error('Cannot delete seller or admin accounts')
      }
    }

    await this.deleteById(userId)
  }

  // Існуючі методи
  async findOne(filters = {}, projection = null, populateFields = []) {
    try {
      return await super.findOne(filters, projection, populateFields)
    } catch (error) {
      return null
    }
  }

  // Повертає всіх користувачів, крім адміністраторів
  async getListWithoutAdmin(
    filters = {},
    projection = { password: 0 },
    populateFields = ['type'],
    options = {},
  ) {
    // Додаємо фільтр, щоб виключити користувачів з роллю 'admin'
    const TypesDBService = (await import('./TypesDBService.mjs')).default
    const typeAdmin = await TypesDBService.findOne({ role: ROLES.ADMIN })
    if (typeAdmin) {
      filters = { ...filters, type: { $ne: typeAdmin._id } }
    }
    return await this.getList(filters, projection, populateFields, options)
  }

  async getList(
    filters = {},
    projection = { password: 0 },
    populateFields = ['type'],
    options = {},
  ) {
    try {
      return await super.getList(filters, projection, populateFields, options)
    } catch (error) {
      return []
    }
  }

  async findUserById(id) {
    return await this.getById(id, ['type'])
  }

  async findUser(filter) {
    return await this.findOne(filter, null, ['type'])
  }

  async createUser(data) {
    const user = await this.create(data)
    return await user.populate('type')
  }

  getUserAuthInfo(user) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.type?.role || 'user',
    }
  }

  /**
   * Отримати активних продавців (які мають товари)
   * @returns {Array} - список продавців
   */
  async getActiveSellers() {
    const ProductsDBService = (await import('./ProductsDBService.mjs')).default
    const TypesDBService = (await import('./TypesDBService.mjs')).default

    // Знаходимо унікальні seller/owner ids з продуктів
    const products = await ProductsDBService.getList(
      { $or: [{ seller: { $ne: null } }, { owner: { $ne: null } }] },
      { seller: 1, owner: 1 },
      [],
      {},
    )

    // Збираємо всі унікальні IDs
    const allIds = products.flatMap((p) => [p.seller, p.owner])
    const sellerIds = [
      ...new Set(allIds.map((id) => id?.toString()).filter(Boolean)),
    ]

    const sellerType = await TypesDBService.findOne({ role: ROLES.SELLER })
    let sellers = []

    if (sellerIds.length > 0) {
      const filters = { _id: { $in: sellerIds } }
      if (sellerType) {
        filters.type = sellerType._id
      }
      sellers = await this.getList(filters)
    }

    // Fallback: якщо немає продавців з продуктами, повертаємо всіх продавців
    if (sellers.length === 0 && sellerType) {
      sellers = await this.getList({ type: sellerType._id })
    }

    return sellers
  }
}

export default new UsersDBService(User)
