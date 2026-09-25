const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/securityLogger');

const uploadDir = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Strict MIME type whitelist
const ALLOWED_MIME_TYPES = Object.freeze([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Strict extension whitelist
const ALLOWED_EXTENSIONS = Object.freeze(['.pdf', '.doc', '.docx']);

// Magic byte signatures for verified file formats
const MAGIC_NUMBERS = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  doc: [0xd0, 0xcf, 0x11, 0xe0], // OLE Compound File
  docx: [0x50, 0x4b, 0x03, 0x04], // PK zip header
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate cryptographically random unguessable filename to prevent traversal and collisions
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `cv-${randomHex}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);

  if (isExtAllowed && isMimeAllowed) {
    return cb(null, true);
  }

  logSecurityEvent({
    type: 'MALICIOUS_UPLOAD_BLOCKED',
    severity: 'WARN',
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?.id,
    email: req.user?.email,
    details: `Blocked upload with disallowed type: extension '${ext}', mimetype '${mime}'`,
    metadata: { originalname: file.originalname, size: file.size },
  });

  cb(new Error('Invalid file type. Only verified PDF (.pdf) and Word documents (.doc, .docx) under 5MB are permitted.'));
};

const uploadCV = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Strict 5MB limit
    files: 1, // Single file upload only
  },
  fileFilter,
});

// Profile image uploads configuration
const profileUploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_IMAGE_EXTENSIONS = Object.freeze(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${randomHex}${safeExt}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ALLOWED_IMAGE_EXTENSIONS.includes(ext) && ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
    return cb(null, true);
  }

  logSecurityEvent({
    type: 'MALICIOUS_IMAGE_UPLOAD_BLOCKED',
    severity: 'WARN',
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?.id,
    email: req.user?.email,
    details: `Blocked image upload with disallowed type: extension '${ext}', mimetype '${mime}'`,
    metadata: { originalname: file.originalname, size: file.size },
  });

  cb(new Error('Invalid image type. Only JPG, PNG, WEBP, and GIF images under 5MB are permitted.'));
};

const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: imageFileFilter,
});

/**
 * Middleware to verify magic bytes of uploaded file after multer disk write
 */
const verifyMagicBytes = (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

  try {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    const expectedMagic = MAGIC_NUMBERS[ext];
    if (expectedMagic) {
      const match = expectedMagic.every((byte, i) => buffer[i] === byte);
      if (!match) {
        // File extension spoofing detected! Delete fake file immediately
        fs.unlinkSync(filePath);
        logSecurityEvent({
          type: 'SPOOFED_FILE_DETECTED',
          severity: 'ERROR',
          ip: req.ip || req.connection?.remoteAddress,
          userId: req.user?.id,
          email: req.user?.email,
          details: `Magic bytes mismatch for extension '${ext}'. File rejected and purged.`,
        });
        return res.status(400).json({
          success: false,
          message: 'Security error: File signature does not match declared extension.',
        });
      }
    }
  } catch (err) {
    console.error('Magic bytes verification error:', err.message);
  }

  next();
};

module.exports = {
  uploadCV,
  uploadImage,
  verifyMagicBytes,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
};

