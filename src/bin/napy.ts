#!/usr/bin/env node
import { cac } from 'cac';
import execa from 'execa';
import inquirer from 'inquirer';
import pkg from '../../package.json';
import { findRootLock } from '../find-root-lock';

const log = console.log;

const cli = cac('napy');

cli
  .command('[root]', undefined, { allowUnknownOptions: true }) // default command
  .action(async () => {
    const args = process.argv.slice(2);
    const command = !args[0]?.startsWith('-') ? args[0] : undefined;

    let { isYarn, isNpm } = findRootLock();

    if (isYarn && isNpm) {
      throw Error(`You shouldn't have both package manager`);
    }

    if (!isYarn && !isNpm) {
      const answers = await inquirer.prompt<{
        pkgm: 'npm' | 'yarn';
      }>([
        {
          type: 'list',
          name: 'pkgm',
          message: 'Please choose your package manager',
          choices: ['npm', 'yarn'],
        },
      ]);

      switch (answers.pkgm) {
        case 'yarn':
          isYarn = true;
          break;
        case 'npm':
          isNpm = true;
          break;
      }
    }

    if (args.includes('-v') || args.includes('--version')) {
      log(`napy/${pkg.version}`);
    }

    if (isYarn) {
      log(`> yarn ${args.join(' ')}`);
      execa(`yarn`, args, { stdio: 'inherit' });
    }

    if (isNpm) {
      if (command) {
        const { stdout: stdoutHelp } = await execa('npm', ['help', '-l']);
        const isNpmCommand = stdoutHelp.includes(`npm ${command}`);

        if (isNpmCommand) {
          log(`> npm ${args.join(' ')}`);
          execa('npm', args, { stdio: 'inherit' });

          return;
        }

        const options = args.filter((arg) => arg.startsWith('-'));
        log(`> npm run ${command} -- ${options.join(' ')}`);
        execa('npm', ['run', command, '--', ...options], { stdio: 'inherit' });

        return;
      }

      log(`> npm install ${args.join(' ')}`);
      execa('npm', ['install', ...args], { stdio: 'inherit' });
    }
  });

cli.parse();
