class MongooseCRUDManager {
  constructor(model) {
    this.model = model
  }

  // Вибірка списку з бази з фільтрами, projection, populateFields та опціями (sort, skip, limit)
  async getList(
    filters = {},
    projection = null,
    populateFields = [],
    options = {},
  ) {
    try {
      let query = this.model.find(filters, projection)

      populateFields.forEach((field) => {
        if (typeof field === 'string') {
          query = query.populate(field)
        } else if (
          typeof field === 'object' &&
          field.fieldForPopulation &&
          field.requiredFieldsFromTargetObject
        ) {
          query = query.populate(
            field.fieldForPopulation,
            field.requiredFieldsFromTargetObject,
          )
        }
      })

      if (options.sort && Object.keys(options.sort).length > 0) {
        query = query.sort(options.sort)
      }
      if (options.skip !== undefined) query = query.skip(options.skip)
      if (options.limit !== undefined) query = query.limit(options.limit)

      const results = await query.exec()

      return results.map((doc) => {
        const obj = doc.toObject({
          virtuals: true,
          versionKey: false,
          transform: (doc, ret) => {
            if (ret._id) ret._id = ret._id.toString()
            return ret
          },
        })
        return obj
      })
    } catch (error) {
      throw new Error('Error retrieving data: ' + error.message)
    }
  }

  // Метод для підрахунку кількості документів за фільтром
  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters)
    } catch (error) {
      throw new Error('Error counting data: ' + error.message)
    }
  }

  // Створення об'єкта і збереження у базі
  async create(data) {
    try {
      const newItem = new this.model(data)
      return await newItem.save()
    } catch (error) {
      throw new Error('Error creating data: ' + error.message)
    }
  }

  // Пошук за id з використанням populateFields
  async getById(id, populateFields = []) {
    try {
      let query = this.model.findById(id)
      populateFields.forEach((field) => {
        query = query.populate(field)
      })
      return await query.exec()
    } catch (error) {
      throw new Error('Error finding data by id: ' + error.message)
    }
  }

  // Пошук одного за фільтром
  async findOne(filters = {}, projection = null, populateFields = []) {
    try {
      let query = this.model.findOne(filters, projection)
      populateFields.forEach((field) => {
        if (typeof field === 'string') {
          // Якщо поле передано як рядок
          query = query.populate(field)
        } else if (
          typeof field === 'object' &&
          field.fieldForPopulation &&
          field.requiredFieldsFromTargetObject
        ) {
          // Якщо передано об'єкт з полем для заповнення та запитуваними полями
          query = query.populate(
            field.fieldForPopulation,
            field.requiredFieldsFromTargetObject,
          )
        }
      })
      return await query.exec()
    } catch (error) {
      throw new Error('Error finding data by id: ' + error.message)
    }
  }
  // Оновлення за id
  async update(id, data) {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .exec()
    } catch (error) {
      throw new Error('Error updating data: ' + error.message)
    }
  }

  // Видалення за id
  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id).exec()
    } catch (error) {
      throw new Error('Error deleting data: ' + error.message)
    }
  }
}

export default MongooseCRUDManager
