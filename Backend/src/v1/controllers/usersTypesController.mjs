import TypesDBService from '../services/TypesDBService.mjs'

class TypeController {
  static async getList(req, res) {
    try {
      const filters = {}
      for (const key in req.query) {
        if (req.query[key]) filters[key] = req.query[key]
      }
      const dataList = await TypesDBService.getList(filters)
      res.status(200).json({
        data: dataList,
        user: req.user,
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getById(req, res) {
    try {
      const id = req.params.id
      let item = null
      if (id) {
        item = await TypesDBService.getById(id)
      }
      res.status(200).json({
        data: item,
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async register(req, res) {
    try {
      const dataObj = req.validated || req.body

      if (req.params.id) {
        const item = await TypesDBService.update(req.params.id, dataObj)
        if (!item)
          return res
            .status(404)
            .json({ success: false, message: 'Type not found' })
        res.json({ success: true, message: 'User type updated', data: item })
      } else {
        const item = await TypesDBService.create(dataObj)
        res.json({ success: true, message: 'User type created', data: item })
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Failed to process user type: ' + err.message,
      })
    }
  }

  static async delete(req, res) {
    try {
      await TypesDBService.deleteById(req.body.id)
      res.json({ success: true })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: 'Failed to delete user type' })
    }
  }
}

export default TypeController
