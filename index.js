const express = require('express');
const bodyParser = require('body-parser');
const triggerTravis = require('lyne-helper-trigger-travis');

const lint = require('@commitlint/lint').default;
const load = require('@commitlint/load').default;

require('dotenv')
  .config();

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const IS_TEST = process.env.TEST;

const getCommitlintParserOptions = (opts) => {
  if (opts.parserPreset) {
    return {
      parserOpts: opts.parserPreset.parserOpts
    };
  }

  return {};
};

const isValidSemanticCommit = (commit) => {
  const config = {
    extends: ['@commitlint/config-conventional']
  };

  return load(config)
    .then((opts) => lint(commit, opts.rules, getCommitlintParserOptions(opts)))
    .then((report) => report.valid)
    .catch((error) => {
      throw new Error(`Error in linting: ${error}`);
    });
};

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
});

app.post('/figma-change', (req, res) => {
  const isFileIcons = req.body.file_key === process.env.FIGMA_FILE_ID_ICONS;
  const isCorrectPasscode = req.body.passcode === process.env.FIGMA_PASSCODE;
  const commit = req.body.description;

  if (!isFileIcons || !isCorrectPasscode) {
    console.log('Either wrong Figma passcode or wrong file key');
    res.sendStatus(400);
  } else {
    console.log('Will trigger travis job for icons');
    const travisUrl = 'https://api.travis-ci.com/repo/lyne-design-system%2Flyne-icons/requests';

    isValidSemanticCommit(commit)
      .then((result) => {
        if (result) {

          triggerTravis({
            branchName: 'master',
            message: `${commit} (triggered from Figma)`,
            travisToken: process.env.TRAVIS_TOKEN,
            travisUrl
          })
            .then(() => {
              // Figma needs status code 200 as answer
              res.sendStatus(200);
            })
            .catch(() => {
              console.log('Error in Triggering Travis');
              res.sendStatus(400);
            });
        } else {
          console.log('Is not a valid commit:');
          console.log(commit);
          res.sendStatus(400);
        }
      })
      .catch((error) => {
        throw new Error(`Error in triggering Travis: ${error}`);
      });
  }
});

const serverInstance = app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}.`);

  if (IS_TEST) {
    serverInstance.close();
    console.log('Server closed again since this is only a test.');
  }
});
