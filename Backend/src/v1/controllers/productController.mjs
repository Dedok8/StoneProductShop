import ProductsDBService from '../services/ProductsDBService.mjs'

class ProductController {
  /**
   * Отримати всі продукти з фільтрацією, пагінацією та сортуванням
   */
  static async getAllProducts(req, res) {
    try {
      const result = await ProductsDBService.getFilteredProducts(
        req.user,
        req.query,
      )
      res.status(200).json({
        ...result,
        user: req.user,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Отримати дані для форми створення/редагування продукту
   */
  static async registerForm(req, res) {
    try {
      const result = await ProductsDBService.getProductFormData(req.params.id)
      res.status(200).json({
        ...result,
        user: req.user,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * Створити або оновити продукт
   */
  static async registerProduct(req, res) {
    try {
      const productData = req.validated || req.body

      // Обробка файлу зображення
      if (req.file?.buffer) {
        productData.image = req.file.buffer.toString('base64')
      }

      await ProductsDBService.createOrUpdateProduct(
        productData,
        req.user,
        req.params.id,
      )

      res.status(200).json({ message: 'Product saved successfully' })
    } catch (error) {
      res.status(500).json({
        error: error.message,
        product: req.body,
        user: req.user,
      })
    }
  }

  /**
   * Видалити продукт
   */
  static async deleteProduct(req, res) {
    try {
      const productId = req.body.id || req.params.id
      await ProductsDBService.deleteProduct(productId, req.user)

      res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

export default ProductController
