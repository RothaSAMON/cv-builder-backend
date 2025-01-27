import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cv } from './schema/cv.schema';
import { Section } from 'src/section/schema/section.schema';
import { deleteFromS3, uploadToS3 } from 'src/utils/s3.utils';

@Injectable()
export class CvService {
  constructor(
    @InjectModel(Cv.name) private readonly cvModel: Model<Cv>,
    @InjectModel(Section.name) private readonly sectionModel: Model<Section>,
  ) {}

  async createCv(cvData: Partial<Cv>, file?: Express.Multer.File): Promise<Cv> {
    if (file) {
      const uploadResult = await uploadToS3(file);
      cvData.previewImageUrl = uploadResult.Location;
    }
    const createdCv = new this.cvModel(cvData);

    // Create default sections for the resume
    const sectionTypes = [
      'PersonalDetail',
      'Contact',
      'Skills',
      'Experiences',
      'Education',
      'Languages',
      'Reference',
    ];

    const defaultSections = sectionTypes.map((type) => ({
      type,
      resumeId: createdCv._id,
      content: {},
    }));

    await this.sectionModel.insertMany(defaultSections);

    return createdCv.save();
  }

  async getAllCvs(userId: string): Promise<Cv[]> {
    return this.cvModel.find({ userId }).exec();
  }

  async getCvById(id: string): Promise<any> {
    const cv = await this.cvModel.findById(id).populate(['userId']).exec();
    if (!cv) throw new Error('CV not found');
    const sections = await this.sectionModel.find({ resumeId: cv._id }).exec();
    return { ...cv.toObject(), sections };
  }

  async updateCv(
    id: string,
    cvData: Partial<Cv>,
    file?: Express.Multer.File,
  ): Promise<Cv> {
    if (file) {
      const existingCv = await this.cvModel.findById(id).exec();
      if (existingCv && existingCv.previewImageUrl) {
        const key = existingCv.previewImageUrl.split('/').pop();
        await deleteFromS3(`ProfileImage/${key}`);
      }
      const uploadResult = await uploadToS3(file);
      cvData.previewImageUrl = uploadResult.Location;
    }
    return this.cvModel.findByIdAndUpdate(id, cvData, { new: true }).exec();
  }

  async deleteCv(id: string): Promise<Cv> {
    const cv = await this.cvModel.findByIdAndDelete(id).exec();
    if (cv && cv.previewImageUrl) {
      const key = cv.previewImageUrl.split('/').pop();
      await deleteFromS3(`ProfileImage/${key}`);
    }
    return cv;
  }
}
