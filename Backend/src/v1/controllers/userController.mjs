import UsersDBService from '../services/UsersDBService.mjs'

class UserController {
  /**
   * Отримати список користувачів з фільтрацією
   */
  static async usersList(req, res) {
    try {
      const users = await UsersDBService.getFilteredUsers(req.query)
      res.status(200).json({
        users,
        user: req.user,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Отримати дані для форми створення/редагування користувача
   */
  static async registerForm(req, res) {
    try {
      const result = await UsersDBService.getUserFormData(req.params.id)
      res.status(200).json({
        errors: [],
        data: result.user,
        types: result.types,
        user: req.user,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Створити або оновити користувача
   */
  static async registerUser(req, res) {
    try {
      const dataObj = req.validated || req.body
      await UsersDBService.createOrUpdateUser(dataObj, req.params.id)

      res.status(200).json({ message: 'User registered successfully' })
    } catch (error) {
      // Отримати типи для відображення помилок
      const TypesDBService = (await import('../services/TypesDBService.mjs'))
        .default
      const types = await TypesDBService.getList()

      res.status(500).json({
        errors: [{ msg: error.message }],
        data: req.body,
        types,
        user: req.user,
      })
    }
  }

  /**
   * Видалити користувача
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.body
      await UsersDBService.deleteUser(id)

      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Отримати активних продавців (які мають товари)
   */
  static async getActiveSellers(req, res) {
    try {
      const sellers = await UsersDBService.getActiveSellers()
      res.status(200).json({ sellers })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default UserController
