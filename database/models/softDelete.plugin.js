function softDeletePlugin(schema, options) {
  // Add fields if not already defined in schema
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  });

  // Middleware for all `find` queries
  schema.pre(/^find/, function (next) {
    if (!this.getFilter().includeDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  });

  // Middleware for `countDocuments`
  schema.pre("countDocuments", function (next) {
    if (!this.getFilter().includeDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  });

  // Add instance method to soft delete a document
  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  // Add static method for restoring
  schema.statics.restore = function (id) {
    return this.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null });
  };
}

module.exports = softDeletePlugin;
