import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './categories.controller';
import { CATEGORY_PROVIDERS } from './categories.provider';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [
    ...Object.values(CATEGORY_PROVIDERS.REPOSITORIES),
    ...Object.values(CATEGORY_PROVIDERS.USE_CASES),
    ...Object.values(CATEGORY_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR
      .provide,
  ],
})
export class CategoriesModule {}
