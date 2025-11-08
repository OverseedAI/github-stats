export default {
    description: 'Schema Generator',
    prompts: [
        {
            type: 'input',
            name: 'name_singular',
            message: 'schema name singular',
        },
        {
            type: 'input',
            name: 'name_plural',
            message: 'schema name plural',
        },
    ],
    actions: [
        {
            type: 'add',
            path: 'src/schemas/{{name_singular}}.ts',
            templateFile: 'generators/schema/schema.hbs',
            abortOnFail: false,
        },
        {
            type: 'append',
            path: 'src/schemas/index.ts',
            template: `export * from './{{name_singular}}';`,
            abortOnFail: false,
        },
        {
            type: 'add',
            path: 'src/server/api/routers/{{name_plural}}.ts',
            templateFile: 'generators/schema/router.hbs',
            abortOnFail: false,
        },
        {
            type: 'add',
            path: 'src/server/services/{{name_plural}}.ts',
            templateFile: 'generators/schema/service.hbs',
            abortOnFail: false,
        },
        {
            type: 'append',
            path: 'src/server/services/index.ts',
            template: `export * from './{{name_plural}}';`,
            abortOnFail: false,
        },
    ],
};
