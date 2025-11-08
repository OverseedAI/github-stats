export default {
  description: 'Component Generator',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'component name',
    },
    {
      type: 'input',
      name: 'folder',
      message: 'folder in components',
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/components/{{folder}}/index.tsx',
      templateFile: 'generators/component/index.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/components/{{folder}}/{{properCase name}}.tsx',
      templateFile: 'generators/component/Component.tsx.hbs',
    },
    {
      type: 'append',
      path: 'src/components/index.tsx',
      template: `export * from './{{folder}}'`,
    },
  ],
};
