import slugify from "slugify";
import { nanoid } from "nanoid";
// utils
import { ErrorClass, cloudinaryConfig, uploadFile } from "../../Utils/index.js";
// models
import { Category, SubCategory, Brand } from "../../../DB/Models/index.js";

/**
 * @api {POST} /sub-categories/create  create a  new subCategory category
 */
export const createSubCategory = async (req, res, next) => {
  // find the category by id
  const category = await Category.findById(req.query.categoryId);
  if (!category) {
    return next(
      new ErrorClass("Category not found", 404, "Category not found")
    );
  }

  // Generating category slug
  const { name } = req.body;

  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  // Image
  if (!req.file) {
    return next(
      new ErrorClass("Please upload an image", 400, "Please upload an image")
    );
  }
  // upload the image to cloudinary
  const customId = nanoid(4);
  const { secure_url, public_id } = await uploadFile({
    file: req.file.path,
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/SubCategories/${customId}`,
  });

  // prepare category object
  const subCategory = {
    name,
    slug,
    Images: {
      secure_url,
      public_id,
    },
    customId,
    categoryId: category._id,
  };

  // create the category in db
  const newSubCategory = await SubCategory.create(subCategory);

  // send the response
  res.status(201).json({
    status: "success",
    message: "Sub-Category created successfully",
    data: newSubCategory,
  });
};

/**
 * @api {GET} /sub-categories Get category by name or id or slug
 */
export const getSubCategory = async (req, res, next) => {
  const { id, name, slug } = req.query;
  const queryFilter = {};

  // check if the query params are present
  if (id) queryFilter._id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  // find the category
  const subCategory = await SubCategory.findOne(queryFilter);

  if (!subCategory) {
    return next(
      new ErrorClass("Category not found", 404, "Category not found")
    );
  }

  res.status(200).json({
    status: "success",
    message: "Category found",
    data: subCategory,
  });
};

/**
 * @api {PUT} /sub-categories/update/:_id  Update a category
 */
export const updateSubCategory = async (req, res, next) => {
  // get the sub-category id
  const { _id } = req.params;

  // destructuring the request body
  const { name, public_id_new } = req.body;

  // find the sub-category by id
  const subCategory = await SubCategory.findById(_id).populate("categoryId");
  if (!subCategory) {
    return next(
      new ErrorClass("subCategory not found", 404, "subCategory not found")
    );
  }

  // Update name and slug
  if (name) {
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });

    subCategory.name = name;
    subCategory.slug = slug;
  }

  //Update Image
  if (req.file) {
    const splitedPublicId = public_id_new.split(`${subCategory.customId}/`)[1];

    const { secure_url } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.category.customId}/SubCategories/${subCategory.customId}`,
      publicId: splitedPublicId,
    });
    subCategory.Images.secure_url = secure_url;
  }

  // save the sub category with the new changes
  await subCategory.save();

  res.status(200).json({
    status: "success",
    message: "SubCategory updated successfully",
    data: subCategory,
  });
};

/**
 * @api {DELETE} /sub-categories/delete/:_id  Delete a category
 */
export const deleteSubCategory = async (req, res, next) => {
  // get the sub-category id
  const { _id } = req.params;

  // find the sub-category by id
  const subCategory = await SubCategory.findByIdAndDelete(_id).populate(
    "categoryId"
  );
  if (!subCategory) {
    return next(
      new ErrorClass("subCategory not found", 404, "subCategory not found")
    );
  }
  // delete the related image from cloudinary
  const subcategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.category.customId}/SubCategories/${subCategory.customId}`;
  // delete the related brands from db
  const deletedBrands = await Brand.deleteMany({
    subCategoryId: subCategory._id,
  });
  if (deletedBrands.deletedCount) {
    // delete the related products from db
    await Product.deleteMany({ subCategoryId: subCategory._id });
  }
  await cloudinaryConfig().api.delete_resources_by_prefix(subcategoryPath);
  await cloudinaryConfig().api.delete_folder(subcategoryPath);

  /**
   * @todo  delete the related products from db
   */
  res.status(200).json({
    status: "success",
    message: "SubCategory deleted successfully",
  });
};
