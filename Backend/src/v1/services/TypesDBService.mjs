import Type from "../models/type/Type.mjs";
import MongooseCRUDManager from "./MongooseCRUDManager.mjs";

class TypesDBService extends MongooseCRUDManager {
  async findOne(
    filters = {},
    projection = null,
    populateFields = [],
    options = {}
  ) {
    try {
      return await super.findOne(filters, projection, populateFields, options);
    } catch (error) {
      return null;
    }
  }
  async getList(
    filters = {},
    projection = null,
    populateFields = [],
    options = {}
  ) {
    try {
      return await super.getList(filters, projection, populateFields, options);
    } catch (error) {
      return [];
    }
  }
}

export default new TypesDBService(Type);
