#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const prompts = require('prompts');
const ora = require('ora');
const json = require('../package.json');

interface Options {
  alias: string;
  description: string;
  requiresArg: boolean;
  required: boolean;
  template: string;
}

interface Argv {
  help: string;
  version: string;
  template: string;
  [key: string]: unknown;
}

type Reply = 'yes' | 'no';

(async () => {
  const argv: Argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Git ignore CLI\n\nUsage: $0 <cmd> [options]')
    .help('help')
    .alias('help', 'h')
    .version('version', json.version || 'Unknown')
    .alias('version', 'v')
    .options({
      template: {
        alias: 't',
        description: 'Git ignore file template name',
        requiresArg: true,
        required: true,
        type: 'string',
      },
    })
    .check((argv: Argv, options: Options) => {
      // Provide some basic checks
      const isValidType = argv.template.trim().length > 0;
      return isValidType;
    }).argv;

  const searchTerm = argv.template.trim().toLowerCase();
  const ignores = await fetchIgnores();

  if (`${searchTerm}` in ignores) {
    const content = ignores[searchTerm].contents.trim();
    const writePath = path.resolve(process.cwd(), '.gitignore');

    if (!fs.existsSync(writePath)) {
      fs.writeFileSync(writePath, content);
      console.log(chalk.green('Successfully created the .gitignore file'));
    } else {
      const { reply }: { reply: Reply } = await prompts({
        type: 'confirm',
        name: 'reply',
        message: 'There is already a .gitignore, do you want to override?',
        validate: false,
      });

      // if reply with "yes", overriding the previous .gitignore file
      if (reply) {
        fs.writeFileSync(writePath, content);
        console.log(chalk.green('Successfully updated the .gitignore file'));
      }
    }
  } else {
    console.log(
      chalk.red(
        `Sorry, the template name "${searchTerm}" you specified didn't match anything from our template list!`,
      ),
    );
  }
})();

async function fetchIgnores() {
  const endpoint =
    'https://www.toptal.com/developers/gitignore/api/list?format=json';
  const spinner = ora('Fetching gitignore list...').start();

  try {
    const { data } = await axios.get(endpoint);
    spinner.succeed();
    return data;
  } catch (error) {
    spinner.fail();
    console.log(error.message);
  }
}
