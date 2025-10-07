import type { Schema, Struct } from '@strapi/strapi';

export interface HomepageTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_homepage_team_members';
  info: {
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    bio: Schema.Attribute.Blocks;
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    role: Schema.Attribute.String;
    socialLinks: Schema.Attribute.JSON;
  };
}

export interface HomepageTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_homepage_testimonials';
  info: {
    displayName: 'Testimonial';
    icon: 'book';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    futured: Schema.Attribute.Boolean;
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    role: Schema.Attribute.String;
  };
}

export interface HomepageWorkStep extends Struct.ComponentSchema {
  collectionName: 'components_homepage_work_steps';
  info: {
    displayName: 'WorkStep';
    icon: 'cog';
  };
  attributes: {
    description: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    stepNumber: Schema.Attribute.Integer;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'homepage.team-member': HomepageTeamMember;
      'homepage.testimonial': HomepageTestimonial;
      'homepage.work-step': HomepageWorkStep;
    }
  }
}
