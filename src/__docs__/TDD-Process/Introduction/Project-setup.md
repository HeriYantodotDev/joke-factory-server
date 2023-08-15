# Set Up the project

First install all the initial dependencies : 

## Initial Dependency

- DevDpendencies :
    
    ```tsx
    "devDependencies": {
        "@types/express": "^4.17.17",
        "@types/jest": "^29.5.0",
        "@types/node": "^18.15.11",
        "@types/supertest": "^2.0.12",
        "reflect-metadata": "^0.1.13",
        "rimraf": "^5.0.0",
        "supertest": "^6.3.3",
        "ts-jest": "^29.1.0",
        "ts-node": "^10.9.1"
      },
    ```
    
- dependencies :
    
    ```tsx
    "dependencies": {
        "express": "^4.18.2"
      }
    ```
    

### install and set up jest &

- Next to set up the folder. The test folder is default in the `src` file and withing the folder `__tests__`
- After that setting up the `jest.config.ts` :
    - Please play attention to change the `testMatch` anytime you change the folder location.
    
    ```tsx
    import type {Config} from '@jest/types';
    
    const config: Config.InitialOptions = {
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      }, 
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    };
    
    export default config;
    ```
    

## setup esLint & Prettier

- Then set up ES Lint
    - [Find and fix problems in your JavaScript code - ESLint - Pluggable JavaScript Linter](https://eslint.org/)
    - documentation : [Getting Started | typescript-eslint](https://typescript-eslint.io/getting-started)
    - install it  :
        - @typescript-eslint/parser
        - @typescript-eslint/eslint-plugin
        - eslint
        
        `npm install --save -dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint` 
        
    - create a file named : `.eslintrc.cjs`
        - Take a look at the rules. In the rules we’re checking our code to follow certain style. For example : `semi` means for semicolor. it shows warning if we forgot to put semi color. Then for quotes, we only use single quote
        - 
        
        ```tsx
        /* eslint-disable-next-line no-undef */
        module.exports = {
          extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2016,
            sourceType: 'module',
            project: './tsconfig.json',
          },
          plugins: ['@typescript-eslint'],
          root: true,
          rules: {
            semi: 'warn',
            quotes: ['warn', 'single'],
            indent: ['error', 2],
          },
        };
        ```
        
    - We have to install ESLint in the VSCode extension to ensure it will shows error in our browser :
    - **`npx eslint <filename>` ⇒ this command will check our linting and shows in our terminal.**
    - to fix it `npx eslint src/index.ts --fix` it’ll fix the linting error.
    - or we can set a npm script `"lint": "eslint ."` this will check all of the file from the root
    - and to fix it we can run `npm run lint -- --fix`
- Prettier - integrate prettier with esLint
    - the package :
        - prettier
        - eslint-config-prettier
        - eslint-plugin-prettier
    - `npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier`
    - then add the configuration both in the `extends` , `plugins`, and in the `rules`. To avoid double error, we can remove the rules for esLint
    - here’s the configuration file :
        
        ```tsx
        /* eslint-disable-next-line no-undef */
        module.exports = {
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended',
          ],
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2016,
            sourceType: 'module',
            project: './tsconfig.json',
          },
          plugins: ['@typescript-eslint', 'prettier'],
          root: true,
          rules: {
            eqeqeq: 'warn',
            'prettier/prettier': [
              'warn',
              {
                singleQuote: true,
                trailingComma: 'all',
                arrowParens: 'avoid',
                printWidth: 108,
                tabWidth: 2,
              },
            ],
          },
        };
        ```
        
    - Remember, that when we use prettier, it won’t allow us save file with the incorrect format. We can save the file without formating : `ctrl + shift + p` then choose save without formating.

