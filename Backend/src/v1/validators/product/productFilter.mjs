import { escapeRegex } from "../helpers.mjs";
import mongoose from "mongoose";

export const PRODUCT_ALLOWED_FILTERS = {
  title: (v) => {
    const raw = String(v ?? "").trim();
    if (!raw) return undefined;
    const safe = escapeRegex(raw);
    return { title: new RegExp(safe, "i") };
  },

  minPrice: (v) => {
    const val = Array.isArray(v) ? v[0] : v;
    const price = Number(val);
    if (!Number.isFinite(price)) return undefined;
    return { price: { $gte: price } };
  },

  maxPrice: (v) => {
    const val = Array.isArray(v) ? v[0] : v;
    const price = Number(val);
    if (!Number.isFinite(price)) return undefined;
    return { price: { $lte: price } };
  },

  seller: (v) => {
    if (!v) return undefined;

    let ids = [];
    if (Array.isArray(v)) {
      // ids = v.flatMap((val) => String(val).split(",").trim().filter(Boolean));
      ids = v.flatMap((val) =>
        String(val)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else if (typeof v === "string") {
      ids = v.split(",").filter(Boolean);
    } else {
      ids = [String(v)];
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) return undefined;

    return {
      seller: {
        $in: validIds.map((id) => `${id}`),
      },
    };
  },

  // legacy
  name: (v) => {
    const raw = String(v ?? "").trim();
    if (!raw) return undefined;
    const safe = escapeRegex(raw);
    return { name: new RegExp(safe, "i") };
  },
};

export function buildProductFilter(query) {
  const filter = {};

  for (const key in PRODUCT_ALLOWED_FILTERS) {
    const val = query[key];
    if (val === undefined || val === null || val === "") continue;

    const result = PRODUCT_ALLOWED_FILTERS[key](val);
    if (!result) continue;

    for (const field in result) {
      const fieldValue = result[field];

      // якщо це об’єкт операторів ($gte/$lte/$in) — об’єднуємо
      if (
        fieldValue &&
        typeof fieldValue === "object" &&
        !Array.isArray(fieldValue) &&
        !(fieldValue instanceof RegExp)
      ) {
        filter[field] = { ...(filter[field] || {}), ...fieldValue };
      } else {
        filter[field] = fieldValue;
      }
    }
  }

  return filter;
}
