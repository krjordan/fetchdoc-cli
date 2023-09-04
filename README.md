# FetchDoc CLI

FetchDoc is a command-line tool that helps developers quickly access the documentation of any npm package. With a simple command, FetchDoc opens the official repository of the specified npm package in your default browser, allowing you to dive straight into the docs.

<!-- ![Demo GIF](path_to_demo_gif.gif) You can add a demo GIF here -->

## Features

- **Quick Access**: Instantly open the official repository of any npm package.
- **Display README**: Option to display the README content directly in the terminal.
- **Search Packages**: (Coming Soon) Search for npm packages by keywords.
- **List Dependencies**: (Coming Soon) Display a list of dependencies for the given npm package.

## Installation

```bash
npm install -g fetchdoc-cli
```

## Usage

To open the documentation of a package:

```bash
fetchdoc <package-name>
```

To display the README content in the terminal:

```bash
fetchdoc <package-name> -r
```

## Contributing

We welcome contributions from the community! If you'd like to contribute, here are a few guidelines:

1. **Fork the Repository**: Click on the 'Fork' button at the top right corner of this page.
2. **Clone Your Fork**: Find the URL of your fork, then run `git clone <your-fork-url>`.
3. **Navigate to the Directory**: `cd fetchdoc-cli`.
4. **Create a New Branch**: `git checkout -b new-feature`.
5. **Make Changes**: Implement your new feature or fix a bug.
6. **Commit Your Changes**: `git commit -am 'Add some feature'`.
7. **Push to the Branch**: `git push origin new-feature`.
8. **Open a Pull Request**: Go to the main page of the repository and click on 'New pull request'.

Please ensure your code adheres to our coding standards and has adequate test coverage.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
