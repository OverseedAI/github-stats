export default {
  description: 'Feature Generator',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Feature name',
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/features/{{name}}/index.tsx',
      templateFile: 'generators/feature/index.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/components/index.tsx',
      templateFile: 'generators/feature/empty.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/routes/index.tsx',
      templateFile: 'generators/feature/page.index.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/routes/{{properCase name}}Page.tsx',
      templateFile: 'generators/feature/Page.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/types/index.ts',
      templateFile: 'generators/feature/empty.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/stores/index.tsx',
      templateFile: 'generators/feature/empty.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/stores/{{name}}Store.ts',
      templateFile: 'generators/feature/stores/store.ts.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{name}}/utils/index.tsx',
      templateFile: 'generators/feature/empty.tsx.hbs',
    },
  ],
};
