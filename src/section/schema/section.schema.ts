import { BadRequestException } from '@nestjs/common';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

// Define allowed section types
const SectionTypes = [
  'PersonalDetail',
  'Contact',
  'Skills',
  'Experiences',
  'Education',
  'Languages',
  'Reference',
] as const;

@Schema({ timestamps: true, discriminatorKey: 'type' })
export class Section {
  @Prop({ type: Types.ObjectId, ref: 'Cv', required: true })
  resumeId: Types.ObjectId;

  @Prop({ required: true, enum: SectionTypes })
  type: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  content: Record<string, any> | any[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

const requiredFieldsByType: Record<string, string[]> = {
  PersonalDetail: ['firstName', 'lastName', 'imageUrl', 'position', 'summary'],
  Contact: ['phoneNumber', 'email', 'address'],
  Skills: ['name', 'level'],
  Experiences: ['jobTitle', 'position', 'startDate', 'endDate'],
  Education: ['schoolName', 'degreeMajor', 'startDate', 'endDate'],
  Languages: ['language', 'level'],
  Reference: [
    'firstName',
    'lastName',
    'position',
    'company',
    'email',
    'phoneNumber',
  ],
};

SectionSchema.pre('save', function (next) {
  const section = this as any;

  const requiredFieldsByType: Record<string, string[]> = {
    PersonalDetail: ['firstName', 'lastName'],
    Contact: ['phoneNumber', 'email', 'address'],
    Skills: ['name', 'level'],
    Experiences: ['jobTitle', 'position', 'startDate', 'endDate'],
    Education: ['schoolName', 'degreeMajor', 'startDate', 'endDate'],
    Languages: ['language', 'level'],
    Reference: [
      'firstName',
      'lastName',
      'position',
      'company',
      'email',
      'phoneNumber',
    ],
  };

  const requiredFields = requiredFieldsByType[section.type];

  if (!requiredFields) {
    return next(
      new BadRequestException(`Invalid section type: ${section.type}`),
    );
  }

  const content = section.content;

  // Handle content as an object or array
  let missingFields: string[] = [];
  if (Array.isArray(content)) {
    // If content is an array, validate each object in the array
    missingFields = requiredFields.filter((field) =>
      content.some(
        (item: any) => item[field] === undefined || item[field] === null,
      ),
    );
  } else if (typeof content === 'object' && content !== null) {
    // If content is an object, validate fields directly
    missingFields = requiredFields.filter(
      (field) => content[field] === undefined || content[field] === null,
    );
  } else {
    return next(
      new BadRequestException(
        'Invalid content format: must be an object or array.',
      ),
    );
  }

  if (missingFields.length > 0) {
    return next(
      new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      ),
    );
  }

  next();
});

// PersonalDetail schema
@Schema()
export class PersonalDetailContent {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop() imageUrl?: string;
  @Prop() position?: string;
  @Prop() summary?: string;
}
export const PersonalDetailContentSchema = SchemaFactory.createForClass(
  PersonalDetailContent,
);

// Contact schema
@Schema()
export class ContactContent {
  @Prop({ required: true }) phoneNumber: string;
  @Prop({ required: true }) email: string;
  @Prop() address?: string;
}
export const ContactContentSchema =
  SchemaFactory.createForClass(ContactContent);

// Skills schema
@Schema()
export class SkillsContent {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) level: string;
}
export const SkillsContentSchema = SchemaFactory.createForClass(SkillsContent);

// Experiences schema
@Schema()
export class ExperiencesContent {
  @Prop({ required: true }) jobTitle: string;
  @Prop() position?: string;
  @Prop({ required: true }) startDate: Date;
  @Prop({ required: true }) endDate: Date;
}
export const ExperiencesContentSchema =
  SchemaFactory.createForClass(ExperiencesContent);

// Education schema
@Schema()
export class EducationContent {
  @Prop({ required: true }) schoolName: string;
  @Prop({ required: true }) degreeMajor: string;
  @Prop({ required: true }) startDate: Date;
  @Prop({ required: true }) endDate: Date;
}
export const EducationContentSchema =
  SchemaFactory.createForClass(EducationContent);

// Languages schema
@Schema()
export class LanguagesContent {
  @Prop({ required: true }) language: string;
  @Prop({ required: true }) level: string;
}
export const LanguagesContentSchema =
  SchemaFactory.createForClass(LanguagesContent);

// Reference schema
@Schema()
export class ReferenceContent {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true }) position: string;
  @Prop({ required: true }) company: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) phoneNumber: string;
}
export const ReferenceContentSchema =
  SchemaFactory.createForClass(ReferenceContent);

// Attach discriminators to the Section schema
SectionSchema.discriminator(
  'PersonalDetail',
  new mongoose.Schema({
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Contact',
  new mongoose.Schema({
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Skills',
  new mongoose.Schema({
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Experiences',
  new mongoose.Schema({
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Education',
  new mongoose.Schema({
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Languages',
  new mongoose.Schema({
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  }),
);

SectionSchema.discriminator(
  'Reference',
  new mongoose.Schema({
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  }),
);
