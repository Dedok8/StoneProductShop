import express from "express";
import ProductController from "../controllers/productController.mjs";
import upload from "../../../middleware/UploadManager.mjs";
import { requireRole } from "../../../middleware/auth.mjs";
import { ROLES } from "../constants/roles.mjs";
import {
  productSchema,
  validateProduct,
} from "../validators/product/productValidator.mjs";

const router = express.Router();

router.get("/", ProductController.getAllProducts);

// router.get(
//   '/register/:id?',
//   requireRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.SELLER]),
//   ProductController.registerForm,
// )

// 1. Для створення нового товару (без ID)
router.get(
  "/register",
  requireRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.SELLER]),
  ProductController.registerForm
);

// 2. Для зміни існуючого товара (с ID)
router.get(
  "/register/:id",
  requireRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.SELLER]),
  ProductController.registerForm
);

router.post(
  "/",
  upload.single("image"),
  requireRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.SELLER]),
  validateProduct(productSchema),
  ProductController.registerProduct
);

router.put(
  "/:id",
  upload.single("image"),
  requireRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.SELLER]),
  validateProduct(productSchema),
  ProductController.registerProduct
);

router.delete(
  "/",
  requireRole([ROLES.ADMIN, ROLES.SELLER]),
  ProductController.deleteProduct
);

export default router;
