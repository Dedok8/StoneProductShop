import TypesDBService from '../services/TypesDBService.mjs'
import UsersDBService from '../services/UsersDBService.mjs'

class FilterService {
  static async getFiltersData(req, res) {
    try {
      const [typesList, usersList] = await Promise.all([
        TypesDBService.getList(),
        UsersDBService.getListWithoutAdmin
          ? UsersDBService.getListWithoutAdmin()
          : UsersDBService.getList(),
      ])
      res.status(200).json({
        data: {
          types: typesList,
          users: usersList,
        },
        success: true,
      })
    } catch (error) {
      res.status(500).json({ error: 'Error fetching filters data' })
    }
  }
}

export default FilterService
