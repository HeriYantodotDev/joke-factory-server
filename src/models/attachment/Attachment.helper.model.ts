import { Attachment } from './Attachment.model';
import { AuthHelperModel } from '../auth';

export class AttachmentHelperModel {
  public static async createAttachment(

  ) {
    await Attachment.create({
      filename: AuthHelperModel.randomString(10),
      uploadDate: new Date(),
    })
  }
}