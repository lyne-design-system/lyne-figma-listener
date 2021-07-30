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

const triggerTravisJob = (commit, response) => {

  console.log('FIGMA-LISTENER: -->> Will trigger travis job for icons');
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
            response.sendStatus(200);
          })
          .catch(() => {
            console.log('FIGMA-LISTENER: -->> Error in Triggering Travis');
            response.sendStatus(400);
          });
      } else {
        console.log('FIGMA-LISTENER: -->> Is not a valid commit:');
        console.log(commit);
        response.sendStatus(400);
      }
    })
    .catch((error) => {
      throw new Error(`FIGMA-LISTENER: -->> Error in triggering Travis: ${error}`);
    });
};

/**
 * If a figma library with thousands of assets is published, the request size
 * for the webhook requests get too large. That's why figma sends several
 * webhooks to make sure, request size meet the desired criteria. But we don't
 * want to trigger our process pipeline for all these batch requests.
 */

let pendingTimeout = false;
let pendingCommitMessage = '';
const pendingDuration = 15 * 1000;

const triggerTravisJobDelayed = (commit, response) => {
  if (pendingTimeout) {
    console.log('FIGMA-LISTENER: -->> Previous received Figma webhook canceld, since I just received a new webhook request.');
    clearTimeout(pendingTimeout);
  }

  if (commit.length > 0) {
    pendingCommitMessage = commit;
  }

  pendingTimeout = setTimeout(() => {
    console.log(`FIGMA-LISTENER: -->> Webhook from Figma received. Waiting for ${pendingDuration} to see if another request comes in.`);
    triggerTravisJob(pendingCommitMessage, response);

    pendingTimeout = false;
    pendingCommitMessage = '';
  }, pendingDuration);

};

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
});

app.post('/figma-change', (req, res) => {
  const isFileIcons = req.body.file_key === process.env.FIGMA_FILE_ID_ICONS;
  const isCorrectPasscode = req.body.passcode === process.env.FIGMA_PASSCODE;
  const commit = req.body.description;

  if (!isFileIcons || !isCorrectPasscode) {
    console.log('FIGMA-LISTENER: -->> Either wrong Figma passcode or wrong file key');
    res.sendStatus(400);
  } else {
    triggerTravisJobDelayed(commit, res);
  }
});

const serverInstance = app.listen(PORT, () => {
  console.log(`FIGMA-LISTENER: -->> Listening to http://localhost:${PORT}.`);

  if (IS_TEST) {
    serverInstance.close();
    console.log('FIGMA-LISTENER: -->> Server closed again since this is only a test.');
  }
});
