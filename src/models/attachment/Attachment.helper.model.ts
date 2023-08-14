import { Attachment } from './Attachment.model';
import { FileUtils, identifyFileType } from '../../utils';

export class AttachmentHelperModel {
  public static async createAttachment(
    file: Express.Multer.File
  ) {
    const fileIdentification = identifyFileType(file.buffer);
    const filename = await FileUtils.saveAttachment(file, fileIdentification);
    const savedAttachment = await Attachment.create({
      filename,
      fileType: fileIdentification.fileType,
      uploadDate: new Date(),
    });

    return {
      id: savedAttachment.id,
    }
  }

  public static async associateAttachmentToJoke(
    fileAttachmentID: number,
    jokeID: number
  ) {
    const attachment = await Attachment.findOne({
      where: {
        id: fileAttachmentID,
      }
    });

    if (!attachment) {
      return;
    }

    if (attachment.jokeID) {
      return;
    }

    attachment.jokeID = jokeID;
    await attachment.save();
  }
}