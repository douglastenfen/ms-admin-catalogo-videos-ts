import { Test } from '@nestjs/testing';
import Joi from 'joi';
import { join } from 'path';
import { CONFIG_DB_SCHEMA, ConfigModule } from '../config.module';

function expectValidate(schema: Joi.Schema, value: any) {
  // @ts-expect-error if the value is invalid, it will throw an error
  return expect(schema.validate(value, { abortEarly: false }).error.message);
}

describe('Schema Unit Test', () => {
  describe('DB Schema', () => {
    const schema = Joi.object({
      ...CONFIG_DB_SCHEMA,
    });

    describe('DB_VENDOR', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain('"DB_VENDOR" is required');

        expectValidate(schema, { DB_VENDOR: 5 }).toContain(
          '"DB_VENDOR" must be one of [mysql, sqlite]',
        );
      });

      test('valid cases', () => {
        const arrange = ['mysql', 'sqlite'];

        arrange.forEach((value) => {
          expectValidate(schema, { DB_VENDOR: value }).not.toContain(
            'DB_VENDOR',
          );
        });
      });
    });

    describe('DB_HOST', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain('"DB_HOST" is required');

        expectValidate(schema, { DB_HOST: 5 }).toContain(
          '"DB_HOST" must be a string',
        );
      });

      test('valid cases', () => {
        expectValidate(schema, { DB_HOST: 'localhost' }).not.toContain(
          'DB_HOST',
        );
      });
    });

    describe('DB_DATABASE', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_DATABASE" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_DATABASE" is required',
        );

        expectValidate(schema, { DB_DATABASE: 5 }).toContain(
          '"DB_DATABASE" must be a string',
        );
      });

      test('valid cases', () => {
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_DATABASE: 'test' },
          { DB_VENDOR: 'mysql', DB_DATABASE: 'test' },
        ];

        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_DATABASE');
        });
      });
    });

    describe('DB_USERNAME', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_USERNAME" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_USERNAME" is required',
        );

        expectValidate(schema, { DB_USERNAME: 5 }).toContain(
          '"DB_USERNAME" must be a string',
        );
      });

      test('valid cases', () => {
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_USERNAME: 'test' },
          { DB_VENDOR: 'mysql', DB_USERNAME: 'test' },
        ];

        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_USERNAME');
        });
      });
    });

    describe('DB_PASSWORD', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PASSWORD" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_PASSWORD" is required',
        );

        expectValidate(schema, { DB_PASSWORD: 5 }).toContain(
          '"DB_PASSWORD" must be a string',
        );
      });

      test('valid cases', () => {
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_PASSWORD: 'test' },
          { DB_VENDOR: 'mysql', DB_PASSWORD: 'test' },
        ];

        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PASSWORD');
        });
      });
    });

    describe('DB_PORT', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PORT" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_PORT" is required',
        );

        expectValidate(schema, { DB_PORT: 'test' }).toContain(
          '"DB_PORT" must be a number',
        );

        expectValidate(schema, { DB_PORT: 5.5 }).toContain(
          '"DB_PORT" must be an integer',
        );
      });

      test('valid cases', () => {
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_PORT: 10 },
          { DB_VENDOR: 'sqlite', DB_PORT: '10' },
          { DB_VENDOR: 'mysql', DB_PORT: 10 },
          { DB_VENDOR: 'mysql', DB_PORT: '10' },
        ];

        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PORT');
        });
      });
    });
  });
});

describe('ConfigModule Unit Tests', () => {
  it('should throw an error when env vars are invalid', async () => {
    try {
      await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: join(__dirname, '.env.fake'),
          }),
        ],
      }).compile();

      fail('ConfigModule should throw an error when env vars are invalid');
    } catch (e) {
      expect(e.message).toContain('"DB_VENDOR" must be one of [mysql, sqlite]');
    }
  });

  it('should be valid', () => {
    const module = Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    });

    expect(module).toBeDefined();
  });
});
