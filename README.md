# gignore-cli

A simple CLI tool for generating .gitignore file

Please note that this is just a person tool for quickly generating a `.gitignore` when bootstrap a new project.

### Install

```sh
npm install -g gignore-cli
```

Or you can use `npx` so you don't even need to install the script

### Usage

Note that if there's an existing `.gitignore`, you can choose to override or skip adding it

```sh
gignore-cli -t node # Add a .gignore file for NodeJS base project
```

Without installing the script

```sh
npx gignore-cli -t node
```

### License

MIT
