const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UPLOAD_DIRECTORY = path.join(
  __dirname,
  '..',
  '..',
  'shared',
  'uploads',
  'products'
);

const MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, UPLOAD_DIRECTORY);
  },

  filename(req, file, callback) {
    const extension = MIME_TYPES[file.mimetype];

    if (!extension) {
      return callback(new Error('Tipo de imagen no permitido.'));
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    return callback(null, uniqueName);
  }
});

function fileFilter(req, file, callback) {
  if (!Object.prototype.hasOwnProperty.call(MIME_TYPES, file.mimetype)) {
    return callback(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname)
    );
  }

  return callback(null, true);
}

const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
}).single('image');

function productImageUpload(req, res, next) {
  uploadProductImage(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        error.publicMessage =
          'La imagen supera el tamaño máximo permitido de 5 MB.';
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        error.publicMessage =
          'Formato de imagen no permitido. Usa JPG, PNG o WebP.';
      } else {
        error.publicMessage = 'No se pudo procesar la imagen seleccionada.';
      }

      error.status = 400;
      return next(error);
    }

    error.publicMessage =
      error.publicMessage || 'No se pudo procesar la imagen seleccionada.';
    error.status = error.status || 400;

    return next(error);
  });
}

module.exports = {
  productImageUpload,
  UPLOAD_DIRECTORY,
  MAX_FILE_SIZE
};
