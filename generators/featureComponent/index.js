import path from 'node:path';
import fs from 'node:fs';

const getFeatures = () => {
  const featureDir = path.join(process.cwd(), `src/features`);
  const features = fs.readdirSync(featureDir);

  return features;
};

export default {
  description: 'Feature Component Generator',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'component name',
    },
    {
      type: 'list',
      name: 'feature',
      message: 'feature name',
      choices: getFeatures,
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/features/{{feature}}/components/{{properCase name}}/index.tsx',
      templateFile: 'generators/featureComponent/index.tsx.hbs',
    },
    {
      type: 'add',
      path: 'src/features/{{feature}}/components/{{properCase name}}/{{properCase name}}.tsx',
      templateFile: 'generators/featureComponent/Component.tsx.hbs',
    },
    {
      type: 'append',
      path: 'src/features/{{feature}}/components/index.tsx',
      templateFile: 'generators/featureComponent/index.tsx.hbs',
    },
  ],
};
