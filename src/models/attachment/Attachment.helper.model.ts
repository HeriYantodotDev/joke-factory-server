import { Attachment } from './Attachment.model';
import { FileUtils } from '../../utils';

export class AttachmentHelperModel {
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const filename = await FileUtils.saveAttachment(file);

    await Attachment.create({
      filename,
      uploadDate: new Date(),
    });
  }
}