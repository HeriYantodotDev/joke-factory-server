import { Attachment } from './Attachment.model';
import { FileUtils, identifyFileType } from '../../utils';

export class AttachmentHelperModel {
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const fileIdentification = identifyFileType(file.buffer);
    const filename = await FileUtils.saveAttachment(file, fileIdentification);
    await Attachment.create({
      filename,
      fileType: fileIdentification.fileType,
      uploadDate: new Date(),
    });
  }
}