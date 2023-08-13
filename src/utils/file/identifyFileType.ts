//I have a problem with file-type package, therefore I created this simple one 
interface fileSignatures {
  [key: string]: string,
}

export interface IdentifyFileTypeResponse {
  fileType: string,
  fileExt: string | null,
}

const fileSignatures:fileSignatures = {
  '89504E47': 'image/png',
  'FFD8FF': 'image/jpg',
  '47494638': 'image/gif',
  '25504446': 'application/pdf',
  '504B0304': 'application/zip',
  '52617221': 'application/x-rar-compressed',
  '424D': 'image/bmp',
  '3C3F786D6C': 'application/xml',
  '504B030414': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '504B030414000600': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '504B030414000208': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '377ABCAF271C': 'application/x-7z-compressed',
  'D0CF11E0A1B11AE1': 'application/msword',
  '504B0708': 'application/java-archive',
  '7573746172': 'application/x-tar',
  '1F8B08': 'application/gzip',
  '4D5A': 'application/x-msdownload',
  '57415645': 'audio/wav',
  '464C56': 'video/x-flv',
  '464F524D': 'audio/midi',
  // Add more signatures and types as needed
};

const mimeTypeMapping: fileSignatures = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'image/bmp': 'bmp',
  'application/xml': 'xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/x-7z-compressed': '7z',
  'application/msword': 'doc',
  'application/java-archive': 'jar',
  'application/x-tar': 'tar',
  'application/gzip': 'gzip',
  'application/x-msdownload': 'msdownload',
  'audio/wav': 'wav',
  'video/x-flv': 'flv',
  'audio/midi': 'midi',
  // Add more mappings as needed
};

export function identifyFileType(buffer: Buffer): IdentifyFileTypeResponse {
  const subBuffer = buffer.subarray(0, 8);
  const signature = subBuffer.toString('hex').toUpperCase();

  const key = Object.keys(fileSignatures).find(magicNumber => signature.startsWith(magicNumber));

  if (!key) {
    return {
      fileType: 'UNKNOWN',
      fileExt: null,
    };
  }

  return {
    fileType: fileSignatures[key],
    fileExt: mimeTypeMapping[fileSignatures[key]],
  };
}