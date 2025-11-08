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
      message: 'Page name',
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
      path: 'src/features/{{feature}}/routes/{{properCase name}}Page.tsx',
      templateFile: 'generators/page/Component.tsx.hbs',
    },
    {
      type: 'append',
      path: 'src/features/{{feature}}/routes/index.tsx',
      templateFile: 'generators/page/index.tsx.hbs',
    },
  ],
};
